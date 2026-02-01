"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/validations/validations";
import userApi from "@/api/userApi";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    try {
      setIsLoading(true);
      const { confirmPassword, ...apiData } = data;

      const res = await userApi.signup(apiData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      sessionStorage.setItem("resendToken", res.data.data.token);
      router.push(`/auth/verifyotp`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message =
            (err.response.data as { message?: string })?.message ||
            "An unknown error occurred";

          if (status === 409) {
            if (message.includes("User already exists")) {
              setError("email", {
                type: "server",
                message: "This email is already registered. Please log in.",
              });
            } else if (message.includes("Username already exists")) {
              setError("username", {
                type: "server",
                message: "This username is taken. Try another.",
              });
            } else {
              setServerError(message);
            }
          } else if (status >= 400 && status < 500) {
            setServerError(message);
          } else {
            setServerError("Server temporarily unavailable.");
          }
        } else {
          setServerError("Network error. Please check your connection.");
        }
      } else {
        setServerError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (codeResponse: { code?: string }) => {
    setIsGoogleLoading(true);
    setServerError(null);

    const code = codeResponse.code;
    if (!code) {
      setServerError("Google authentication failed.");
      setIsGoogleLoading(false);
      return;
    }

    try {
      const res = await userApi.googleLogin(code);
      localStorage.setItem("accessToken", res.data.data.accessToken);

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
            const workspaceApi = (await import("@/api/workspaceApi")).default;
            await workspaceApi.acceptInvite(invitationToken);
            router.push(`/workspace/${workspaceId}`);
            return;
          } catch (error) {
            console.error("Failed to accept invitation:", error);
            clearInvitationData();
          }
        }
      }

      if (res.data.data.newUser) {
        router.push("/onboarding/username");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || "Google login failed.");
      } else {
        setServerError("An error occurred during Google sign-in.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const googleAuth = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleAuthSuccess,
    onError: () => {
      setServerError("Google sign-in was cancelled.");
      setIsGoogleLoading(false);
    },
  });

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none";

  const inputErrorClasses =
    "w-full px-4 py-3 rounded-xl border border-[var(--error)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error-light)] focus:outline-none";

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
                R
              </div>
              <span className="text-xl font-semibold">ResearchZone</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Start your research journey today.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Create your free account and join a community of researchers
              pushing the boundaries of knowledge.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/70">Join 10,000+ researchers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>© 2026 ResearchZone</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <span className="text-xl font-semibold text-[var(--text-primary)]">
              ResearchZone
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
              Create your account
            </h2>
            <p className="text-[var(--text-secondary)]">
              Get started with your free account
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 animate-fade-in">
              <p className="text-sm text-[var(--error)] text-center">
                {serverError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  {...register("firstName")}
                  className={
                    errors.firstName ? inputErrorClasses : inputClasses
                  }
                />
                {errors.firstName && (
                  <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  {...register("lastName")}
                  className={errors.lastName ? inputErrorClasses : inputClasses}
                />
                {errors.lastName && (
                  <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                placeholder="Choose a username"
                {...register("username")}
                className={errors.username ? inputErrorClasses : inputClasses}
              />
              {errors.username && (
                <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email address"
                {...register("email")}
                className={errors.email ? inputErrorClasses : inputClasses}
              />
              {errors.email && (
                <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Create a password"
                {...register("password")}
                className={errors.password ? inputErrorClasses : inputClasses}
              />
              {errors.password && (
                <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={
                  errors.confirmPassword ? inputErrorClasses : inputClasses
                }
              />
              {errors.confirmPassword && (
                <p className="text-[var(--error)] text-xs mt-1.5 ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="px-4 text-sm text-[var(--text-tertiary)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={() => googleAuth()}
            className="w-full py-3 px-4 rounded-xl font-medium border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-[var(--text-secondary)]"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? "Connecting..." : "Google"}</span>
          </button>

          {/* Login link */}
          <p className="text-center mt-8 text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[var(--accent-primary)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
