import Link from "next/link";
import Button from "@/components/Button";

export default function LandingPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 text-center px-6">
      {/* Card Section */}
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
          2FA Auth System
        </h1>
        {/* Subtitle */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Add an extra layer of security to your account with{" "}
          <span className="text-indigo-600 font-semibold">
            One-Time Password (OTP)
          </span>{" "}
          verification.
        </p>
        {/* Illustration
        <div className="flex justify-center mb-8">
          <img
            src="/otp-illustration.svg"
            alt="2FA OTP Illustration"
            className="w-48 h-48"
          />
        </div> */}
        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button
              text="Login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-md transition cursor-pointer"
            />
          </Link>
          <Link href="/signup">
            <Button
              text="Signup"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-md transition cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-sm text-gray-500 mt-6">
        Your security is our priority 🔐
      </p>
    </div>
  );
}
