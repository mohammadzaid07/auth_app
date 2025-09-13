"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ColorAuth from "@/components/ColorAuth";

export default function ColorPasswordPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("userData");
    if (data) {
      setUserData(JSON.parse(data));
    } else {
      // If no user data, redirect back to the start
      router.push("/signup");
    }
  }, [router]);

  const handleComplete = (colorPassword) => {
    if (userData) {
      // Add the selected color password to the user data
      const updatedUserData = { ...userData, colorPassword };
      sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
      // Proceed to the next step: setting the image password
      router.push("/graphical-password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <ColorAuth onComplete={handleComplete} />
      </div>
    </div>
  );
}