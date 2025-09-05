"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function VerifyPage() {
  const router = useRouter();
  const [emailFromQuery, setEmailFromQuery] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");
      if (email) {
        setEmailFromQuery(email);
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/auth/match-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailFromQuery, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <form
        onSubmit={handleVerify}
        className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md"
      >
        <Link
          href="/login"
          className="absolute -top-12 left-0 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">
          Enter OTP 🔒
        </h2>

        <Input
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="text-gray-800 mb-4"
        />

        <Button
          type="submit"
          disabled={loading}
          text={loading ? "Verifying..." : "Verify OTP"}
          className={`w-full mt-4 py-3 rounded-xl shadow-md transition cursor-pointer ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        />
      </form>
    </div>
  );
}
