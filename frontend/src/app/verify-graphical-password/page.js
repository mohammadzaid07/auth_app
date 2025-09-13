"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GraphicalAuth from "@/components/GraphicalAuth";
import { apiRequest } from "@/lib/api";

export default function VerifyGraphicalPasswordPage() {
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

    const handleComplete = async (graphicalPassword) => {
        try {
            const data = await apiRequest("/api/auth/verify-graphical-password", "POST", {
                email,
                graphicalPassword,
            });
            alert(data.message);
            // Final step is successful, go to the dashboard
            router.push("/dashboard");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <GraphicalAuth onComplete={handleComplete} isLogin={true} />
            </div>
        </div>
    );
}