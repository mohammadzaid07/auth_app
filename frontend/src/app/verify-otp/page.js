"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";

// 🚀 This tells Next.js not to pre-render this page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromQuery = searchParams.get("email");

  const [email, setEmail] = useState(emailFromQuery || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if email not present
  useEffect(() => {
    if (!emailFromQuery) router.push("/signup");
  }, [emailFromQuery, router]);

  // Countdown for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error verifying OTP");
      } else {
        alert("Email verified ✅ Please login");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error, try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error resending OTP");
      } else {
        alert("OTP resent 📧");
        setCountdown(60);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error, try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <form
        onSubmit={handleVerify}
        className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md"
      >
        <Link
          href="/signup"
          className="absolute -top-12 left-0 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">
          Verify Your Email 🔒
        </h2>

        {email && <Input label="Email" value={email} disabled className="mb-4" />}

        <Input
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />

        <Button
          type="submit"
          disabled={loading}
          text={loading ? "Verifying..." : "Verify OTP"}
          className="w-full mt-6 py-3 rounded-xl"
        />

        <Button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          text={
            countdown > 0
              ? `Resend OTP in ${countdown}s`
              : resendLoading
              ? "Resending..."
              : "Resend OTP"
          }
          className="w-full mt-4 py-3 rounded-xl"
        />

        <p className="mt-6 text-sm text-gray-600 text-center">
          Already verified?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
