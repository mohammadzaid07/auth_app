"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user session storage (example)
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-300 px-6 py-12">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Welcome to the Dashboard</h1>
        <p className="text-indigo-600 mb-8">
          Manage your account and explore new features. Your secure space is ready!
        </p>
        <Button
          type="button"
          onClick={handleLogout}
          text="Logout"
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 rounded-xl cursor-pointer shadow-lg transition-transform active:scale-95"
        />
      </div>
      <footer className="mt-12 text-indigo-600 opacity-80 text-sm select-none">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}
