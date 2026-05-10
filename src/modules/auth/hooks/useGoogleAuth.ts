"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import authApi from "@/modules/auth/apis/authApi";
import { GoogleAuthCodeResponse } from "@/modules/auth/types/auth";
import useInvitationRedirect from "@/modules/auth/hooks/useInvitationRedirect";

type UseGoogleAuthOptions = {
  onError?: (message: string) => void;
};

export default function useGoogleAuth(options?: UseGoogleAuthOptions) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { handleInvitationRedirect } = useInvitationRedirect();

  const handleGoogleAuthSuccess = async (
    codeResponse: GoogleAuthCodeResponse,
  ) => {
    setIsGoogleLoading(true);
    options?.onError?.("");

    const code = codeResponse.code;
    if (!code) {
      options?.onError?.("Google authentication failed.");
      setIsGoogleLoading(false);
      return;
    }

    try {
      const res = await authApi.googleLogin(code);
      localStorage.setItem("accessToken", res.data.data.accessToken);

      const handledInvitation = await handleInvitationRedirect();

      if (handledInvitation) {
        return;
      }

      if (res.data.data.newUser) {
        router.push("/onboarding/username");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        options?.onError?.(
          error.response?.data?.message || "Google login failed.",
        );
      } else {
        options?.onError?.("An error occurred during Google sign-in.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const startGoogleAuth = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleAuthSuccess,
    onError: () => {
      options?.onError?.("Google sign-in was cancelled.");
      setIsGoogleLoading(false);
    },
  });

  return {
    isGoogleLoading,
    startGoogleAuth,
  };
}
