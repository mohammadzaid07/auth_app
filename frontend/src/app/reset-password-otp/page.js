// frontend/src/app/reset-password-otp/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button"; // Adjust path as needed
import ColorAuth from "@/components/ColorAuth"; // Adjust path as needed
import GraphicalAuth from "@/components/GraphicalAuth"; // Adjust path as needed
import { API_URL } from "@/lib/api"; // Adjust path as needed

export default function ResetPasswordOTPPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [colorPattern, setColorPattern] = useState([]);
    const [imagePattern, setImagePattern] = useState([]);
    const [step, setStep] = useState(1); // 1: OTP, 2: Password, 3: Color, 4: Image
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Retrieve email from session storage
        const storedEmail = sessionStorage.getItem("resetEmail");
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // If no email, redirect back to forgot password
            router.push("/forgot-password");
        }
    }, [router]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!otp) {
            setError("Please enter the OTP.");
            setLoading(false);
            return;
        }

        try {
            // Re-use the matchOTP backend endpoint to verify the OTP for reset flow
            const res = await fetch(`${API_URL}/api/auth/match-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep(2); // Move to password input
            } else {
                setError(data.message || "Invalid or expired OTP.");
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setStep(3); // Move to color pattern
    };

    const handleColorPatternComplete = (pattern) => {
        setColorPattern(pattern);
        setStep(4); // Move to image pattern
    };

    const handleImagePatternComplete = async (pattern) => {
        setImagePattern(pattern);
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp, // Still need the OTP to identify the reset session
                    password,
                    colorPassword: colorPattern,
                    graphicalPassword: pattern, // This is the final image pattern
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "Password and patterns reset successfully!");
                sessionStorage.removeItem("resetEmail"); // Clear stored email
                router.push("/login"); // Redirect to login
            } else {
                setError(data.message || "Failed to reset password and patterns.");
            }
        } catch (err) {
            console.error("Full reset error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset Your Credentials
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Step {step} of 4: Update your account.
                </p>

                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

                {step === 1 && (
                    <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">
                                Enter OTP (sent to {email})
                            </label>
                            <div className="mt-2">
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    maxLength="6"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                text={loading ? "Verifying..." : "Verify OTP"}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            />
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                New Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                                Confirm New Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                text="Set Password"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            />
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Set New Color Pattern</h3>
                        <ColorAuth onComplete={handleColorPatternComplete} />
                    </div>
                )}

                {step === 4 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Set New Image Pattern</h3>
                        <GraphicalAuth onComplete={handleImagePatternComplete} />
                    </div>
                )}
            </div>
        </div>
    );
}