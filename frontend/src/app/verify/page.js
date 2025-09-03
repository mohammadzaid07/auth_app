"use client";
import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email"); // get email from query

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailFromQuery) {
      router.push("/login"); // redirect if no email
    }
  }, [emailFromQuery, router]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      //   const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email: emailFromQuery, otp }),
      //   });

      //   const data = await res.json();

      //   if (res.ok) {
      //     // OTP matches → go to dashboard
      //     router.push("/dashboard");
      //   } else {
      //     // OTP invalid → show alert
      //     alert(data.message || "Invalid OTP. Please try again.");
      //   }

      const res = await fetch("http://localhost:3000/api/auth/match-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromQuery, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard"); // OTP matched
      } else {
        alert(data.message || "Invalid OTP"); // OTP wrong
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
        {/* Back Button */}
        <Link
          href="/login"
          className="absolute -top-12 left-0 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">
          Enter OTP 🔒
        </h2>

        {/* OTP Input */}
        <Input
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="text-gray-800 mb-4"
        />

        {/* Verify Button */}
        <Button
          type="submit"
          disabled={loading}
          text={loading ? "Verifying..." : "Verify OTP"}
          className={`w-full mt-4 py-3 rounded-xl shadow-md transition cursor-pointer ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        />
      </form>
    </div>
  );
}
