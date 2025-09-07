export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // Express backend

export async function apiRequest(endpoint, method = "GET", body) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // include cookies for auth
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${res.status}`
      );
    }

    return await res.json();
  } catch (err) {
    console.error("API request error:", err.message);
    throw err; // rethrow so frontend can handle
  }
}
