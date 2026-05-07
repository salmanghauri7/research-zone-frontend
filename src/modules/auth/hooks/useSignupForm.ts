"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/validations/validations";
import authApi from "@/modules/auth/apis/authApi";
import { useForm } from "@/shared/components/ui";

type SignupFormData = z.infer<typeof signupSchema>;

export default function useSignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);

    try {
      setIsLoading(true);
      const { confirmPassword, ...apiData } = data;

      const res = await authApi.signup(apiData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      sessionStorage.setItem("resendToken", res.data.data.token);
      router.push("/auth/verifyotp");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message =
            (err.response.data as { message?: string })?.message ||
            "An unknown error occurred";

          if (status === 409) {
            if (message.includes("User already exists")) {
              form.setError("email", {
                type: "server",
                message: "This email is already registered. Please log in.",
              });
            } else if (message.includes("Username already exists")) {
              form.setError("username", {
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

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    serverError,
    isLoading,
    setServerError,
  };
}
