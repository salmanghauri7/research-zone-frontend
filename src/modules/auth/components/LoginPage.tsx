"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import useLoginForm from "@/modules/auth/hooks/useLoginForm";
import useGoogleAuth from "@/modules/auth/hooks/useGoogleAuth";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
} from "@/shared/components/ui";

export default function LoginPage() {
  const { form, handleSubmit, apiError, buttonText, setApiError } =
    useLoginForm();
  const { isGoogleLoading, startGoogleAuth } = useGoogleAuth({
    onError: (message) => setApiError(message || null),
  });

  const isSubmitting = form.formState.isSubmitting;

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)]";

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
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

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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

          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 animate-fade-in">
              <p className="text-sm text-[var(--error)] text-center">
                {apiError}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                        className={inputClasses}
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
                        className={inputClasses}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[var(--error)]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
              >
                {isSubmitting ? (
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

          {/* <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="px-4 text-sm text-[var(--text-tertiary)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          <Button
            type="button"
            onClick={() => startGoogleAuth()}
            disabled={isSubmitting || isGoogleLoading}
            variant="outline"
            className="w-full border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <FcGoogle className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{isGoogleLoading ? "Connecting..." : "Google"}</span>
          </Button> */}

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
