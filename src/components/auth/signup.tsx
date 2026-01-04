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
import { FcGoogle } from "react-icons/fc";
import { TokenResponse, useGoogleLogin } from "@react-oauth/google";
import { CgSpinner } from "react-icons/cg"; // --- 1. IMPORTED SPINNER ---

// ✅ Define Zod schema type
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

  // --- STANDARD EMAIL/PASSWORD SIGNUP LOGIC ---
  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    try {
      setIsLoading(true);
      const { confirmPassword, ...apiData } = data;

      const res = await userApi.signup(apiData);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      sessionStorage.setItem("resendToken", res.data.data.token);
      router.push(`/auth/verifyotp`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Axios Error:", err.message);
        console.error("Response Data:", err.response?.data);

        if (err.response) {
          const status = err.response.status;
          const message =
            (err.response.data as { message?: string })?.message ||
            "An unknown server error occurred";

          if (status === 409) {
            if (message.includes("User already exists")) {
              setError("email", {
                type: "server",
                message:
                  "An account with this email already exists and is verified. Please log in.",
              });
            } else if (message.includes("Username already exists")) {
              setError("username", {
                type: "server",
                message:
                  "This username is already taken. Please choose a different one.",
              });
            } else {
              setServerError(message);
            }
          } else if (status >= 400 && status < 500) {
            setServerError(message);
          } else {
            setServerError("Server temporarily unavailable. Please try again.");
          }
        } else {
          setServerError("Network error. Please check your connection.");
        }
      } else {
        console.error("Unexpected Error:", err);
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (codeResponse: any) => {
    setIsGoogleLoading(true);
    setServerError(null);

    const code = codeResponse.code;

    if (!code) {
      setServerError("Google authentication failed: No code received.");
      setIsGoogleLoading(false);
      return;
    }

    try {
      const res = await userApi.googleLogin(code);

      // 2. Handle the successful response from your backend.
      // This is where you typically receive your application's JWT or session token.
      const accessToken = res.data.data.accessToken;

      localStorage.setItem("accessToken", accessToken);

      // Check if user is in invitation flow
      const { isInInvitationFlow, getInvitationToken, getPendingWorkspaceId, clearInvitationData } = await import("@/utils/invitationStorage");

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

      // Redirect to the dashboard or home page

      if (res.data.data.newUser) {
        router.push("/onboarding/username");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      // Handle errors specific to your backend's login route
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string })?.message ||
          "Google login failed on server side.";
        setServerError(message);
      } else {
        setServerError("An unknown error occurred during Google sign-in.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // --- 2. UPDATED HOOK with onError ---
  const googleAuth = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleAuthSuccess,
    onError: (error) => {
      // Handle cases where the user closes the popup or login fails
      console.error("Google Login Error:", error);
      setServerError(
        "Google sign-in was cancelled or failed. Please try again."
      );
      setIsGoogleLoading(false); // Ensure loading state is reset
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create an Account
        </h2>

        {/* ⚠️ Display top-level server error */}
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ... (All your inputs remain the same) ... */}
          {/* First + Last Name */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="w-1/2">
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className={`w-full border ${errors.confirmPassword
                ? "border-red-500"
                : "border-gray-300 dark:border-white/10"
                } bg-white dark:bg-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg py-2 font-semibold hover:opacity-90 transition disabled:opacity-60"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="grow border-gray-300 dark:border-white/10" />
          <span className="px-2 text-gray-500 dark:text-white/50 text-sm">
            or
          </span>
          <hr className="grow border-gray-300 dark:border-white/10" />
        </div>

        {/* --- 3. UPDATED GOOGLE BUTTON --- */}
        <button
          type="button"
          onClick={() => googleAuth()}
          className="w-full flex items-center justify-center border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white rounded-lg py-2 transition hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading || isGoogleLoading} // Disable when ANY loading is active
        >
          {isGoogleLoading ? (
            <>
              <CgSpinner size={22} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FcGoogle size={22} className="mr-2" />
              Sign up with Google
            </>
          )}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600 dark:text-white/60 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-black dark:text-white font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
