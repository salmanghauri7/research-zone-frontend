"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import workspaceApi from "@/api/workspaceApi";
import {
    saveInvitationToken,
    setInvitationFlag,
    savePendingWorkspaceId,
    clearInvitationData,
} from "@/utils/invitationStorage";
import { CgSpinner } from "react-icons/cg";

export default function AcceptInvitationPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying your invitation...");
    const [errorDetails, setErrorDetails] = useState("");

    useEffect(() => {
        const verifyAndProcess = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Invalid invitation link");
                setErrorDetails("No token provided in the URL.");
                return;
            }

            try {
                // Step 1: Verify the invitation token
                setMessage("Verifying your invitation...");
                const verifyResponse = await workspaceApi.verifyInvite(token);

                if (!verifyResponse.data.success) {
                    setStatus("error");
                    setMessage("Invitation verification failed");
                    setErrorDetails(verifyResponse.data.message || "Unknown error occurred");
                    return;
                }

                const { workspaceId } = verifyResponse.data.data;

                // Step 2: Save invitation data to localStorage
                saveInvitationToken(token);
                setInvitationFlag(true);
                savePendingWorkspaceId(workspaceId);

                // Step 3: Check if user is authenticated
                const accessToken = localStorage.getItem("accessToken");

                if (accessToken) {
                    // User is authenticated - accept invitation immediately
                    setMessage("Accepting invitation...");

                    try {
                        await workspaceApi.acceptInvite(token);

                        setStatus("success");
                        setMessage("Invitation accepted successfully!");

                        // Redirect to workspace
                        setTimeout(() => {
                            router.push(`/workspace/${workspaceId}`);
                        }, 1000);
                    } catch (acceptError: any) {
                        setStatus("error");
                        setMessage("Failed to accept invitation");
                        setErrorDetails(
                            acceptError.response?.data?.message || "Could not accept the invitation"
                        );
                        // Clear invitation data on error
                        clearInvitationData();
                    }
                } else {
                    // User is not authenticated - redirect to login
                    setStatus("success");
                    setMessage("Redirecting to login...");

                    setTimeout(() => {
                        router.push("/auth/login");
                    }, 1500);
                }
            } catch (error: any) {
                setStatus("error");
                setMessage("Verification failed");
                setErrorDetails(
                    error.response?.data?.message ||
                    "The invitation link is invalid or has expired."
                );
            }
        };

        verifyAndProcess();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl rounded-2xl p-8">
                <div className="text-center">
                    {status === "verifying" && (
                        <div className="flex flex-col items-center space-y-4">
                            <CgSpinner size={48} className="animate-spin text-black dark:text-white" />
                            <h2 className="text-xl font-semibold">{message}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please wait while we process your invitation...
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                                {message}
                            </h2>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                                {message}
                            </h2>
                            {errorDetails && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {errorDetails}
                                </p>
                            )}
                            <button
                                onClick={() => router.push("/auth/login")}
                                className="mt-4 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
