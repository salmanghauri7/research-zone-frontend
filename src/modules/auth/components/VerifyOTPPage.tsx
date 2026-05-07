"use client";

import { CheckCircle2 } from "lucide-react";
import ResendTimer from "@/shared/components/resendTimer";
import useVerifyOTPForm from "@/modules/auth/hooks/useVerifyOTPForm";
import { Button, Card, CardContent, Input } from "@/shared/components/ui";

export default function VerifyOTPPage() {
  const {
    otp,
    inputRefs,
    message,
    isVerifying,
    canResend,
    setCanResend,
    handleChange,
    handleKeyDown,
    handleResend,
  } = useVerifyOTPForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
            Verify Your Account
          </h2>

          {/* Email Sent Banner */}
          <p className="text-[var(--text-muted)] text-center mb-6">
            We&apos;ve sent a 6-digit code to your email.
            <br />
            <span className="text-sm text-[var(--text-muted)]">
              (The code expires in 5 minutes.)
            </span>
          </p>

          {/* OTP Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
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

          {/* Message */}
          {message && (
            <p className="text-sm text-[var(--text-secondary)] min-h-5 mt-4 transition-all">
              {message}
            </p>
          )}

          {/* Resend */}
          <div className="mt-6 text-sm text-[var(--text-muted)]">
            Didn&apos;t receive the code?{" "}
            <Button
              onClick={handleResend}
              type="button"
              variant="link"
              disabled={!canResend || isVerifying}
              className={`h-auto p-0 font-semibold transition-colors ${
                !canResend || isVerifying
                  ? "text-[var(--text-muted)] cursor-not-allowed"
                  : "text-[var(--accent-primary)] hover:underline"
              }`}
            >
              Resend Code
            </Button>
            {!canResend && (
              <span className="ml-2 text-[var(--text-muted)]">
                <ResendTimer seconds={30} onFinish={() => setCanResend(true)} />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
