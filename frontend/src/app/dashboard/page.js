"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user session (example: localStorage)
    localStorage.removeItem("authToken"); // if you store JWT or similar
    localStorage.removeItem("userEmail"); // optional, if you store email

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Dashboard</h1>
      <Button
        type="button"
        onClick={handleLogout}
        text="Logout"
        className="bg-red-500 hover:bg-red-600 text-white py-3 px-8 rounded-xl shadow-md transition"
      />
    </div>
  );
}
