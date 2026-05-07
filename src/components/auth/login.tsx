"use client";

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
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useUserStore } from "@/store/userStore";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
  Button,
} from "@/shared/components/ui";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Sign in");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
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
      } = await import("@/utils/storage/invitationStorage");

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
      } = await import("@/utils/storage/invitationStorage");

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
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 animate-fade-in">
              <p className="text-sm text-[var(--error)] text-center">
                {apiError}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--text-secondary)]">
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Enter your email or username"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[var(--error)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--text-secondary)]">
                      Password
                    </FormLabel>
                    <FormControl>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[var(--error)]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isGoogleLoading}
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {buttonText}
                  </span>
                ) : (
                  buttonText
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="px-4 text-sm text-[var(--text-tertiary)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            onClick={() => googleAuth()}
            disabled={form.formState.isSubmitting || isGoogleLoading}
            variant="outline"
            className="w-full border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <FcGoogle className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{isGoogleLoading ? "Connecting..." : "Google"}</span>
          </Button>

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
