"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/validations";
import userApi from "@/api/userApi";
import workspaceApi from "@/api/workspaceApi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Sign in");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setButtonText("Verifying...");

    try {
      const apiData = data.identifier.includes("@")
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

      await new Promise((resolve) => setTimeout(resolve, 600));
      const res = await userApi.login(apiData);

      localStorage.setItem("accessToken", res.data.data.accessToken);
      setUser(res.data.data.user);

      setButtonText("Success!");
      await new Promise((resolve) => setTimeout(resolve, 800));

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
            await workspaceApi.acceptInvite(invitationToken);
            router.push(`/workspace/${workspaceId}`);
            return;
          } catch (error) {
            console.error("Failed to accept invitation:", error);
            clearInvitationData();
          }
        }
      }

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Login failed.";

        if (status === 403) {
          setApiError(message + " Please verify your email.");
        } else if (status === 401) {
          setApiError(message);
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
      } else {
        setApiError("Network error. Please check your connection.");
      }
      setButtonText("Sign in");
    }
  };

  const handleGoogleAuthSuccess = async (codeResponse: { code?: string }) => {
    setIsGoogleLoading(true);
    setApiError(null);

    const code = codeResponse.code;
    if (!code) {
      setApiError("Google authentication failed.");
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
      if (err instanceof AxiosError) {
        setApiError(err.response?.data?.message || "Google login failed.");
      } else {
        setApiError("An error occurred during Google sign-in.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const googleAuth = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleAuthSuccess,
    onError: () => {
      setApiError("Google sign-in was cancelled.");
      setIsGoogleLoading(false);
    },
  });

  const combinedError =
    apiError || errors.identifier?.message || errors.password?.message || null;

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
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
              Collaborate on research like never before.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of researchers who use ResearchZone to organize
              papers, collaborate with teams, and accelerate their discoveries.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>© 2026 ResearchZone</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
              Welcome back
            </h2>
            <p className="text-[var(--text-secondary)]">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Error Alert */}
          {combinedError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 animate-fade-in">
              <p className="text-sm text-[var(--error)] text-center">
                {combinedError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Email or Username
              </label>
              <input
                type="text"
                placeholder="Enter your email or username"
                {...register("identifier")}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
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
                  {buttonText}
                </span>
              ) : (
                buttonText
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

          {/* Google Login */}
          <button
            type="button"
            onClick={() => googleAuth()}
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl font-medium border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

          {/* Sign up link */}
          <p className="text-center mt-8 text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[var(--accent-primary)] font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
