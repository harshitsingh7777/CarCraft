const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getVehicles(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();

  const url = `${API_BASE_URL}/vehicles/api/${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vehicles: ${response.status}`
    );
  }

  return response.json();
}

export async function getVehicleById(id) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/api/${id}/`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vehicle ${id}: ${response.status}`
    );
  }

  return response.json();
}