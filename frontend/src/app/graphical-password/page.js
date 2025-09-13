"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GraphicalAuth from "@/components/GraphicalAuth";
import { apiRequest } from "@/lib/api";

export default function GraphicalPasswordPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("userData");
    const parsedData = data ? JSON.parse(data) : null;

    // Make sure we have the color password before proceeding
    if (parsedData && parsedData.colorPassword) {
      setUserData(parsedData);
    } else {
      router.push("/signup"); // Go back to start if data is incomplete
    }
  }, [router]);

  const handleComplete = async (graphicalPassword) => {
    if (userData) {
      try {
        const finalUserData = { ...userData, graphicalPassword };
        const data = await apiRequest("/api/auth/register", "POST", finalUserData);

        // Clear the stored data after successful submission
        sessionStorage.removeItem("userData");

        alert("Registration successful! Please verify your email with the OTP we sent.");
        router.push(`/verify-otp?email=${userData.email}`);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <GraphicalAuth onComplete={handleComplete} />
      </div>
    </div>
  );
}