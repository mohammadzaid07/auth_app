"use client";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../utils/api"; // ✅ adjust path based on your folder structure

export default function AuthForm({ type }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (type === "signup" && !form.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);

        const endpoint = type === "signup" ? "/api/auth/register" : "/api/auth/login";

        // ✅ Use apiRequest helper
        const data = await apiRequest(endpoint, "POST", form);

        if (type === "signup") {
          alert("Account created! OTP sent to your email.");
          router.push(`/verify-otp?email=${form.email}`);
        } else {
          alert("OTP sent to your email. Please verify.");
          router.push(`/verify?email=${form.email}`);
        }
      } catch (error) {
        console.error("Error:", error.message);
        alert(error.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md"
      >
        <Link
          href="/"
          className="absolute -top-12 left-0 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">
          {type === "login" ? "Welcome Back 👋" : "Create Your Account ✨"}
        </h2>

        {type === "signup" && (
          <>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="text-gray-800"
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="text-gray-800"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="text-gray-800"
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}

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
                {type === "login" ? "Logging in..." : "Signing up..."}
              </div>
            ) : type === "login" ? (
              "Login"
            ) : (
              "Sign Up"
            )
          }
          className={`w-full mt-6 py-3 rounded-xl shadow-md transition cursor-pointer ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        />

        <p className="mt-6 text-sm text-gray-600 text-center">
          {type === "login" ? (
            <>
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
