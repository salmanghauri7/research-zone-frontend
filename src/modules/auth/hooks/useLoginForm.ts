"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/validations";
import authApi from "@/modules/auth/apis/authApi";
import { useUserStore } from "@/store/userStore";
import { useForm } from "@/shared/components/ui";
import useInvitationRedirect from "@/modules/auth/hooks/useInvitationRedirect";

type LoginFormData = z.infer<typeof loginSchema>;

export default function useLoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Sign in");
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const { handleInvitationRedirect } = useInvitationRedirect();

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

      const res = await authApi.login(apiData);

      localStorage.setItem("accessToken", res.data.data.accessToken);
      setUser(res.data.data.user);

      setButtonText("Success!");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const handledInvitation = await handleInvitationRedirect();

      if (!handledInvitation) {
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Login failed.";

        if (status === 403) {
          setApiError(`${message} Please verify your email.`);
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

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    apiError,
    buttonText,
    setApiError,
  };
}
