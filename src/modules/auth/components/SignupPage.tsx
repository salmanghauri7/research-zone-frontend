"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import useSignupForm from "@/modules/auth/hooks/useSignupForm";
import useGoogleAuth from "@/modules/auth/hooks/useGoogleAuth";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Input,
  Button,
} from "@/shared/components/ui";

export default function SignupPage() {
  const { form, handleSubmit, serverError, isLoading, setServerError } =
    useSignupForm();

  const { isGoogleLoading, startGoogleAuth } = useGoogleAuth({
    onError: (message) => setServerError(message || null),
  });

  const { errors } = form.formState;

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none";

  const inputErrorClasses =
    "w-full px-4 py-3 rounded-xl border border-[var(--error)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error-light)] focus:outline-none";

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-700 to-cyan-800">
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

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 animate-fade-in">
              <p className="text-sm text-[var(--error)] text-center">
                {serverError}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="First name"
                          className={
                            errors.firstName ? inputErrorClasses : inputClasses
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--error)] text-xs mt-1.5 ml-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Last name"
                          className={
                            errors.lastName ? inputErrorClasses : inputClasses
                          }
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage className="text-[var(--error)] text-xs mt-1.5 ml-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        className={
                          errors.username ? inputErrorClasses : inputClasses
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-(--error) text-xs mt-1.5 ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email address"
                        className={
                          errors.email ? inputErrorClasses : inputClasses
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-(--error) text-xs mt-1.5 ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className={
                          errors.password ? inputErrorClasses : inputClasses
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[var(--error)] text-xs mt-1.5 ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        className={
                          errors.confirmPassword
                            ? inputErrorClasses
                            : inputClasses
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[var(--error)] text-xs mt-1.5 ml-1" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="px-4 text-sm text-[var(--text-tertiary)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          <Button
            type="button"
            onClick={() => startGoogleAuth()}
            className="w-full py-3 px-4 rounded-xl font-medium border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            disabled={isLoading || isGoogleLoading}
            variant="outline"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <FcGoogle className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{isGoogleLoading ? "Connecting..." : "Google"}</span>
          </Button>

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
