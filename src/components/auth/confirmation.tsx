"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ConfirmEmailPage() {
    const [message, setMessage] = useState("");

    const handleResend = async () => {
        setMessage("Sending new confirmation email... 📤");

        // Simulate API call delay (for UI feedback)
        setTimeout(() => {
            setMessage("📨 A new confirmation email has been sent!");
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-full max-w-md bg-white text-black shadow-xl rounded-2xl p-8 text-center">
                {/* ✅ Icon */}
                <div className="text-5xl mb-4">📧</div>

                {/* ✅ Heading */}
                <h2 className="text-2xl font-semibold mb-3">
                    Confirm Your Email
                </h2>

                {/* ✅ Message */}
                <p className="text-gray-600 text-sm mb-6">
                    We’ve sent a confirmation link to your registered email address.
                    Please check your inbox (and spam folder) to verify your account.
                </p>

                {/* ✅ Resend button */}
                <button
                    onClick={handleResend}
                    className="w-full bg-black text-white rounded-lg py-2 font-semibold hover:opacity-90 transition"
                >
                    Resend Email
                </button>

                {/* ✅ Inline Message */}
                {message && (
                    <p className="text-sm text-gray-700 mt-4">{message}</p>
                )}

                {/* ✅ Go back to Login */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already verified?{" "}
                    <Link
                        href="/auth/login"
                        className="text-black font-semibold hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
