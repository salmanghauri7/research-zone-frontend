"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { loginSchema } from "@/validations/validations";
import api from "@/utils/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { CgSpinner } from "react-icons/cg";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Log In");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setButtonText("Verifying credentials...");

    try {
      const apiData = data.identifier.includes("@")
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

      await new Promise((resolve) => setTimeout(resolve, 600));
      const res = await api.post("/api/users/login", apiData);

      localStorage.setItem("accessToken", res.data.data.accessToken);

      setButtonText("Logging you in...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setButtonText("Redirecting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("redirecting to dashboard");

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Login failed.";

        if (status === 403) {
          setApiError(
            message + " Please check your email to verify your account."
          );
        } else if (status === 401) {
          setApiError(message);
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
      } else {
        setApiError("Network error. Please check your connection.");
      }

      setButtonText("Log In");
    }
  };

  const handleGoogleAuthSuccess = async (codeResponse: { code?: string }) => {
    setIsGoogleLoading(true);
    setApiError(null);

    const code = codeResponse.code;

    if (!code) {
      setApiError("Google authentication failed: No code received.");
      setIsGoogleLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/users/google-login", { code });
      const accessToken = res.data.data.accessToken;

      localStorage.setItem("accessToken", accessToken);
      if (res.data.data.newUser) {
        router.push("/onboarding/username");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message =
          err.response?.data?.message || "Google login failed on server side.";
        setApiError(message);
      } else {
        setApiError("An unknown error occurred during Google sign-in.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const googleAuth = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleAuthSuccess,
    onError: (error) => {
      console.error("Google Login Error:", error);
      setApiError("Google sign-in was cancelled or failed. Please try again.");
      setIsGoogleLoading(false);
    },
  });

  // Combine frontend + backend errors
  const combinedError =
    apiError || errors.identifier?.message || errors.password?.message || null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Welcome Back
        </h2>

        {/* --- GLOBAL ERROR BOX --- */}
        {combinedError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm mb-4 text-center">
            {combinedError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier Field */}
          <input
            type="text"
            placeholder="Username or Email"
            {...register("identifier")}
            className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />

          {/* Password Field */}
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full bg-black text-white rounded-lg py-2 font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? buttonText : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300 dark:border-white/10" />
          <span className="px-2 text-gray-500 dark:text-white/50 text-sm">
            or
          </span>
          <hr className="flex-grow border-gray-300 dark:border-white/10" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => googleAuth()}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <>
              <CgSpinner size={22} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FcGoogle size={22} className="mr-2" />
              Log in with Googlee
            </>
          )}
        </button>

        {/* Extra Links */}
        <div className="text-center mt-4 text-sm">
          <p className="text-gray-600 dark:text-white/60">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="text-black dark:text-white font-medium hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
