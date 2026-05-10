import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import authApi from "@/modules/auth/apis/authApi";
import { useUserStore } from "@/store/userStore";

interface ApiErrorResponse {
  message: string;
}

const isApiError = (data: unknown): data is ApiErrorResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
  );
};

export default function useVerifyOTPForm() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const setUser = useUserStore((state) => state.setUser);

  // Focus first input on page load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next
    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // auto verify if full
    const completedOtp = newOtp.join("");
    if (completedOtp.length === 6) {
      verifyOtp(completedOtp);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // OTP verification logic with modern error handling
  const verifyOtp = async (enteredOtp: string) => {
    setIsVerifying(true);
    setMessage("Verifying... ⏳");

    try {
      const res = await authApi.verifyOtp(enteredOtp);
      localStorage.setItem("accessToken", res.data.data.accessToken);
      setUser(res.data.data.user);

      setMessage(" OTP Verified Successfully! ");

      // Check if user is in invitation flow
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
            setMessage("Accepting invitation...");
            const workspaceApi = (await import("@/api/workspaceApi")).default;
            await workspaceApi.acceptInvite(invitationToken);

            setTimeout(() => router.push(`/workspace/${workspaceId}`), 1500);
            return;
          } catch (error) {
            console.error("Failed to accept invitation:", error);
            clearInvitationData();
          }
        }
      }

      // On success, keep inputs disabled until redirect
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error instanceof AxiosError) {
        const errorData = error.response?.data;

        if (isApiError(errorData)) {
          errorMessage = errorData.message;
        } else if (error.response?.status === 400) {
          errorMessage = "Invalid or Expired OTP.";
        } else {
          errorMessage =
            "A network error occurred. Please check your connection.";
        }
      }

      setMessage(`❌ ${errorMessage}`);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  // Resend OTP logic
  const handleResend = async () => {
    try {
      if (!canResend) return;
      setMessage("Sending new OTP... ");
      setCanResend(false);
      const token = sessionStorage.getItem("resendToken");
      await authApi.resendOtp(token!);

      setTimeout(() => {
        setMessage(" New OTP has been sent to your email.");
      }, 1500);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    otp,
    inputRefs,
    message,
    isVerifying,
    canResend,
    setCanResend,
    handleChange,
    handleKeyDown,
    handleResend,
  };
}
