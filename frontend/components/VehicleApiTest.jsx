"use client";

import { useVehicles } from "../lib/api/useVehicles";

export default function VehicleApiTest() {
  const { vehicles, loading, error } = useVehicles();

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: "16px 20px",
          background: "#111",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading vehicles...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: "16px 20px",
          background: "#220909",
          color: "#ff6b6b",
          border: "1px solid #552020",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
          maxWidth: "350px",
        }}
      >
        <strong>Vehicle API Error</strong>
        <br />
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        width: "360px",
        maxHeight: "80vh",
        overflowY: "auto",
        padding: "20px",
        background: "rgba(5, 7, 10, 0.94)",
        color: "#fff",
        border: "1px solid #333",
        borderRadius: "10px",
        fontFamily: "Arial, sans-serif",
        backdropFilter: "blur(10px)",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: "18px",
        }}
      >
        Django Vehicles
      </h3>

      <p
        style={{
          margin: "0 0 16px",
          color: "#aaa",
          fontSize: "14px",
        }}
      >
        {vehicles.length} vehicles received from Django
      </p>

      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          style={{
            padding: "14px 0",
            borderTop: "1px solid #292929",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {vehicle.brand} {vehicle.model}
          </div>

          {vehicle.variant && (
            <div
              style={{
                marginTop: "4px",
                color: "#aaa",
                fontSize: "13px",
              }}
            >
              {vehicle.variant}
            </div>
          )}

          <div
            style={{
              marginTop: "8px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5px",
              color: "#bbb",
              fontSize: "12px",
            }}
          >
            <span>Type: {vehicle.body_type}</span>
            <span>Fuel: {vehicle.fuel_type}</span>
            <span>Power: {vehicle.horsepower || "—"} HP</span>
            <span>Torque: {vehicle.torque || "—"} Nm</span>
            <span>Stock: {vehicle.stock_quantity}</span>
            <span>Status: {vehicle.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}