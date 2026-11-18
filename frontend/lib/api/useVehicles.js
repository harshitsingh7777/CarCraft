"use client";

import { useEffect, useState } from "react";

import { getVehicles } from "./vehicles";

export function useVehicles(filters = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      try {
        setLoading(true);
        setError(null);

        const data = await getVehicles(filters);

        if (!cancelled) {
          setVehicles(data);
        }
      } catch (err) {
        console.error("Vehicle API error:", err);

        if (!cancelled) {
          setError(
            err.message || "Failed to load vehicles"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return {
    vehicles,
    loading,
    error,
  };
}