export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // your express backend

export async function apiRequest(endpoint, method = "GET", body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // if using cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}
