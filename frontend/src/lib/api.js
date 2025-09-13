export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiRequest(endpoint, method = "GET", data = null) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {

      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMessage);

      error.status = res.status;
      error.data = errorData;
      throw error;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {

      console.warn(`Response from ${endpoint} was not JSON, status: ${res.status}`);
      return { message: res.statusText || 'Success (no content)' };
    }

  } catch (err) {
    console.error("API request error:", err.message);
    throw err; // rethrow so frontend can handle
  }
}