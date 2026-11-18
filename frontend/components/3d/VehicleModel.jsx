"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, BufferAttribute, BufferGeometry, Group, Mesh, Quaternion, Vector3 } from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { getGlowTexture } from "../../lib/three/textures";

const SPIN = 26; // rad/s
const GETTERS = ["getX", "getY", "getZ", "getW"];

/**
 * Some models merge all four wheels into ONE mesh per part (tyre, rim, disc).
 * Detect those meshes (wheel-height, spans the wheelbase, sits at axle height),
 * split their triangles into 4 corners and return one group per corner.
 */
function splitMergedWheels(obj, outer) {
  const car = new Box3().setFromObject(outer);
  const mid = car.getCenter(new Vector3());

  const sets = [];
  obj.traverse((n) => {
    if (!n.isMesh || Array.isArray(n.material) || !n.geometry?.attributes?.position) return;
    const b = new Box3().setFromObject(n);
    const s = b.getSize(new Vector3());
    const c = b.getCenter(new Vector3());
    if (s.y < 0.3 || s.y > 0.95 || s.z < 2.2 || s.x < 1.4) return;
    if (c.y - car.min.y > 0.5 || Math.abs(c.z - mid.z) > 0.6) return;
    sets.push(n);
  });
  if (!sets.length) return [];

  const corners = [[], [], [], []];
  const a = new Vector3();
  const cen = new Vector3();

  for (const n of sets) {
    const g = n.geometry.index ? n.geometry.toNonIndexed() : n.geometry;
    const pos = g.attributes.position;
    n.updateWorldMatrix(true, false);

    const buckets = [[], [], [], []];
    for (let i = 0; i + 2 < pos.count; i += 3) {
      cen.set(0, 0, 0);
      for (let k = 0; k < 3; k++) cen.add(a.fromBufferAttribute(pos, i + k));
      cen.multiplyScalar(1 / 3).applyMatrix4(n.matrixWorld);
      buckets[(cen.x > mid.x ? 1 : 0) + (cen.z > mid.z ? 2 : 0)].push(i);
    }

    buckets.forEach((tris, q) => {
      if (!tris.length) return;
      const geo = new BufferGeometry();
      for (const name of Object.keys(g.attributes)) {
        const attr = g.attributes[name];
        const size = attr.itemSize;
        const out = new Float32Array(tris.length * 3 * size);
        let o = 0;
        for (const start of tris) {
          for (let k = 0; k < 3; k++) {
            for (let c = 0; c < size; c++) out[o++] = attr[GETTERS[c]](start + k);
          }
        }
        geo.setAttribute(name, new BufferAttribute(out, size));
      }
      const piece = new Mesh(geo, n.material);
      piece.name = `${n.name}_wheel${q}`;
      piece.position.copy(n.position);
      piece.quaternion.copy(n.quaternion);
      piece.scale.copy(n.scale);
      n.parent.add(piece);
      corners[q].push(piece);
    });

    n.removeFromParent();
  }

  obj.updateMatrixWorld(true);

  const out = [];
  corners.forEach((pieces) => {
    if (!pieces.length) return;
    // wheel centre from the biggest piece (the tyre)
    let best = null;
    let bestH = 0;
    for (const p of pieces) {
      const b = new Box3().setFromObject(p);
      const h = b.getSize(new Vector3()).y;
      if (h > bestH) {
        bestH = h;
        best = b;
      }
    }
    out.push({ centre: best.getCenter(new Vector3()), members: pieces });
  });
  return out;
}

/** Fallback for models whose wheels are already separate meshes. */
function findSeparateWheels(obj, outer) {
  const car = new Box3().setFromObject(outer);
  const carSize = car.getSize(new Vector3());
  const items = [];
  obj.traverse((n) => {
    if (!n.isMesh) return;
    const b = new Box3().setFromObject(n);
    if (b.isEmpty()) return;
    items.push({ n, c: b.getCenter(new Vector3()), s: b.getSize(new Vector3()) });
  });

  const tyres = [];
  for (const it of items) {
    const { s, c } = it;
    const d = Math.max(s.y, s.z);
    const round = s.y / s.z > 0.85 && s.y / s.z < 1.18;
    if (d < 0.5 || d > 0.95 || !round) continue;
    if (s.x < 0.1 || s.x > d * 0.6) continue;
    if (c.y - car.min.y < 0.2 || c.y - car.min.y > 0.55) continue;
    if (Math.abs(c.x - (car.min.x + car.max.x) / 2) < carSize.x * 0.28) continue;
    if (Math.abs(c.z - (car.min.z + car.max.z) / 2) < carSize.z * 0.15) continue;
    tyres.push(it);
  }

  const centres = [];
  tyres.sort((p, q) => Math.max(q.s.y, q.s.z) - Math.max(p.s.y, p.s.z));
  for (const t of tyres) if (!centres.some((k) => k.c.distanceTo(t.c) < 0.25)) centres.push(t);

  return centres.map((t) => {
    const dia = Math.max(t.s.y, t.s.z);
    const members = items.filter(
      (it) =>
        Math.hypot(it.c.y - t.c.y, it.c.z - t.c.z) < 0.15 &&
        Math.abs(it.c.x - t.c.x) < 0.3 &&
        Math.max(it.s.y, it.s.z) <= dia * 1.08
    );
    return { centre: t.c, members: members.map((m) => m.n) };
  });
}

/**
 * Loads a GLB, clones it, auto-scales it to `length` metres, grounds and centres it.
 * Forward is local +z. Wheels are found (split if merged) and spun around the axle.
 * `children` is a function receiving { width, height, length }.
 */
export default function VehicleModel({ url, length = 4.8, flip = true, envIntensity = 1.0, children }) {
  const { scene } = useGLTF(url);

  const { wrapper, dims, wheels, axis } = useMemo(() => {
    const obj = clone(scene);
    obj.traverse((c) => {
      if (c.isMesh && c.material) {
        c.material = c.material.clone();
        c.material.envMapIntensity = envIntensity;
      }
    });

    const raw = new Box3().setFromObject(obj).getSize(new Vector3());
    const alongX = raw.x > raw.z;
    const s = length / (alongX ? raw.x : raw.z);

    const inner = new Group();
    inner.add(obj);
    inner.rotation.y = (alongX ? Math.PI / 2 : 0) + (flip ? Math.PI : 0);
    inner.scale.setScalar(s);

    const outer = new Group();
    outer.add(inner);
    outer.updateMatrixWorld(true);

    const box = new Box3().setFromObject(outer);
    const c = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    outer.position.set(-c.x, -box.min.y, -c.z);
    outer.updateMatrixWorld(true);

    // world x (car's sideways axis) expressed in the model's local space
    const axis = new Vector3(1, 0, 0).applyQuaternion(obj.getWorldQuaternion(new Quaternion()).invert());

    let found = splitMergedWheels(obj, outer);
    if (!found.length) found = findSeparateWheels(obj, outer);

    const wheels = found.map(({ centre, members }) => {
      const pivot = new Group();
      pivot.position.copy(obj.worldToLocal(centre.clone()));
      obj.add(pivot);
      obj.updateMatrixWorld(true);
      members.forEach((m) => pivot.attach(m));
      return { pivot, angle: 0 };
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[VehicleModel] wheels spinning: ${wheels.length}`);
    }

    return { wrapper: outer, dims: { width: size.x, height: size.y, length: size.z }, wheels, axis };
  }, [scene, length, flip, envIntensity]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05) * SPIN;
    for (let i = 0; i < wheels.length; i++) {
      const w = wheels[i];
      w.angle = (w.angle + d) % (Math.PI * 2);
      w.pivot.quaternion.setFromAxisAngle(axis, w.angle);
    }
  });

  return (
    <>
      <primitive object={wrapper} />
      {/* fake contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} renderOrder={1}>
        <planeGeometry args={[dims.width * 1.5, dims.length * 1.3]} />
        <meshBasicMaterial
          map={getGlowTexture()} color="#000000" transparent opacity={0.75}
          depthWrite={false} polygonOffset polygonOffsetFactor={-2}
        />
      </mesh>
      {children?.(dims)}
    </>
  );
}