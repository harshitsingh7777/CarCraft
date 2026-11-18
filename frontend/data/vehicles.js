export const VEHICLES = [
  {
    id: "bmw-m4",
    name: "BMW M4 Competition",
    category: "Sports",
    model: "/models/bmw_m4.glb",
    length: 4.8,
    flip: false,
  },
];

export const getVehicle = (id) =>
  VEHICLES.find((v) => v.id === id);


/*
============================================================
HIGHWAY TRAFFIC
============================================================

The cars are deliberately separated.

Hero:
  right lane

Police / chase car 1:
  left lane, clearly behind

Police / chase car 2:
  center lane, further behind

Do not allow the chase cars to dynamically close
the distance to the hero.
============================================================
*/

export const HIGHWAY_TRAFFIC = [
  {
    id: "hero",
    vehicleId: "bmw-m4",
    role: "hero",
    siren: false,

    motion: {
      lane: 2.4,
      gap: 0,

      weave: {
        amp: 0.18,
        freq: 0.35,
      },

      zAmp: 0.25,
      phase: 0,
    },
  },

  {
    id: "chase-1",
    vehicleId: "bmw-m4",
    role: "chaser",
    siren: true,

    motion: {
      lane: -2.8,

      /*
      Clearly behind the hero.
      */

      gap: -14,

      weave: {
        amp: 0.22,
        freq: 0.35,
      },

      zAmp: 0.35,
      phase: 1.7,
    },
  },

  {
    id: "chase-2",
    vehicleId: "bmw-m4",
    role: "chaser",
    siren: true,

    motion: {
      lane: 0.5,

      /*
      Much further behind.
      */

      gap: -29,

      weave: {
        amp: 0.28,
        freq: 0.3,
      },

      zAmp: 0.45,
      phase: 3.4,
    },
  },
];