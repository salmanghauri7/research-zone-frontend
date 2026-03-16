"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios"; // 👈 Import AxiosError
import ResendTimer from "@/components/resendTimer";
import userApi from "@/api/userApi";
import { useUserStore } from "@/store/userStore";

// A type guard for our specific API error structure
// This assumes your backend sends { message: "..." } on error
interface ApiErrorResponse {
  message: string;
}

const isApiError = (data: any): data is ApiErrorResponse => {
  return data && typeof data.message === "string";
};

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const setUser = useUserStore((state) => state.setUser);

  // ✅ Focus first input on page load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ✅ Handle OTP input change
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next
    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // auto verify if full
    const completedOtp = newOtp.join("");
    if (completedOtp.length === 6) {
      verifyOtp(completedOtp);
    }
  };

  // ✅ Handle backspace navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ OTP verification logic (with modern error handling)
  const verifyOtp = async (enteredOtp: string) => {
    setIsVerifying(true);
    setMessage("Verifying... ⏳");

    try {
      const res = await userApi.verifyOtp(enteredOtp);
      localStorage.setItem("accessToken", res.data.data.accessToken);
      setUser(res.data.data.user);

      setMessage(" OTP Verified Successfully! ");

      // Check if user is in invitation flow
      const {
        isInInvitationFlow,
        getInvitationToken,
        getPendingWorkspaceId,
        clearInvitationData,
      } = await import("@/utils/invitationStorage");

      if (isInInvitationFlow()) {
        const invitationToken = getInvitationToken();
        const workspaceId = getPendingWorkspaceId();

        if (invitationToken && workspaceId) {
          try {
            setMessage("Accepting invitation...");
            const workspaceApi = (await import("@/api/workspaceApi")).default;
            await workspaceApi.acceptInvite(invitationToken);

            setTimeout(() => router.push(`/workspace/${workspaceId}`), 1500);
            return;
          } catch (error) {
            console.error("Failed to accept invitation:", error);
            clearInvitationData();
          }
        }
      }

      // On success, we keep inputs disabled until we redirect
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      // 1. Check if it's an Axios error
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;

        if (isApiError(errorData)) {
          errorMessage = errorData.message;
        } else if (error.response?.status === 400) {
          errorMessage = "Invalid or Expired OTP.";
        } else {
          errorMessage =
            "A network error occurred. Please check your connection.";
        }
      }

      // 3. Update the UI with clear feedback
      setMessage(`❌ ${errorMessage}`);
      setOtp(Array(6).fill("")); // Clear the inputs
      inputRefs.current[0]?.focus(); // Focus the first box for re-entry
      setIsVerifying(false); // Re-enable inputs
    }
    // We remove the 'finally' block to have different logic for success (stay disabled) vs. error (re-enable)
  };

  // ✅ Resend OTP logic (simulation)

  const handleResend = async () => {
    try {
      if (!canResend) return;
      setMessage("Sending new OTP... ");
      setCanResend(false);
      const token = sessionStorage.getItem("resendToken");
      await userApi.resendOtp(token!);

      // simulate delay
      setTimeout(() => {
        setMessage(" New OTP has been sent to your email.");
      }, 1500);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary)]  rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
          Verify Your Account
        </h2>

        {/* ✅ Email Sent Banner */}
        <p className="text-[var(--text-muted)] text-center mb-6">
          We&apos;ve sent a 6-digit code to your email.
          <br />
          <span className="text-sm text-[var(--text-muted)]">
            (The code expires in 5 minutes.)
          </span>
        </p>

        {/* ✅ OTP Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              // Use "tel" type for better mobile numeric keyboard
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              disabled={isVerifying}
              className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border rounded-xl focus:outline-none focus:ring-2 transition-all bg-[var(--bg-primary)] text-[var(--text-primary)] ${
                isVerifying
                  ? "border-[var(--border-primary)] opacity-50 cursor-not-allowed"
                  : "border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/30"
              }`}
            />
          ))}
        </div>

        {/* ✅ Message */}
        {message && (
          <p className="text-sm text-[var(--text-secondary)] min-h-5 mt-4 transition-all">
            {message}
          </p>
        )}

        {/* ✅ Resend */}
        <div className="mt-6 text-sm text-[var(--text-muted)]">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend || isVerifying}
            className={`font-semibold transition-colors ${
              !canResend || isVerifying
                ? "text-[var(--text-muted)] cursor-not-allowed"
                : "text-[var(--accent-primary)] hover:underline"
            }`}
          >
            Resend Code
          </button>
          {!canResend && (
            <span className="ml-2 text-[var(--text-muted)]">
              <ResendTimer seconds={30} onFinish={() => setCanResend(true)} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
