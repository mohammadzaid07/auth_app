"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ColorAuth from "@/components/ColorAuth";
import { apiRequest } from "@/lib/api";

export default function VerifyColorPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailFromQuery = params.get("email");
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleComplete = async (colorPassword) => {
        try {
            await apiRequest("/api/auth/verify-color-password", "POST", {
                email,
                colorPassword,
            });
            // On success, proceed to the final step: graphical image verification
            router.push(`/verify-graphical-password?email=${email}`);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <ColorAuth onComplete={handleComplete} isLogin={true} />
            </div>
        </div>
    );
}