"use client";
import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email");

  const [email, setEmail] = useState(emailFromQuery || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // Cooldown timer

  useEffect(() => {
    if (!emailFromQuery) {
      router.push("/signup");
    }
  }, [emailFromQuery, router]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error verifying OTP");
      } else {
        alert("Email verified ✅ Please login");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error resending OTP");
      } else {
        alert("OTP resent successfully 📧 Check your email!");
        setCountdown(60); // start 1 minute cooldown
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("An unexpected error occurred. Please try again.");
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
        {/* Back Button */}
        <Link
          href="/signup"
          className="absolute -top-12 left-0 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">
          Verify Your Email 🔒
        </h2>

        {/* Email Display */}
        {email && (
          <Input
            label="Email"
            value={email}
            disabled
            className="text-gray-800 mb-4"
          />
        )}

        {/* OTP Input */}
        <Input
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="text-gray-800"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          text={
            loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Verifying...
              </div>
            ) : (
              "Verify OTP"
            )
          }
          className={`w-full mt-6 py-3 rounded-xl shadow-md transition cursor-pointer ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        />

        {/* Resend OTP Button */}
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
          className={`w-full mt-4 py-3 rounded-xl shadow-md transition cursor-pointer ${
            resendLoading || countdown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
          }`}
        />

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-600 text-center">
          Already verified?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
