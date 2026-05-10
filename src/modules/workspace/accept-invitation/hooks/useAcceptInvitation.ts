import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import workspaceApi from "@/api/workspaceApi";
import {
  saveInvitationToken,
  setInvitationFlag,
  savePendingWorkspaceId,
  clearInvitationData,
} from "@/utils/storage/invitationStorage";

export type InvitationStatus = "verifying" | "success" | "error";

interface VerifyInviteResponse {
  data: {
    success?: boolean;
    message?: string;
    data?: {
      workspaceId?: string;
    };
  };
}

interface ApiErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as ApiErrorLike;
    return apiError.response?.data?.message || fallback;
  }

  return fallback;
};

export default function useAcceptInvitation(token: string) {
  const router = useRouter();
  const [status, setStatus] = useState<InvitationStatus>("verifying");
  const [message, setMessage] = useState("Verifying your invitation...");
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    const verifyAndProcess = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid invitation link");
        setErrorDetails("No token provided in the URL.");
        return;
      }

      try {
        setMessage("Verifying your invitation...");
        const verifyResponse = (await workspaceApi.verifyInvite(
          token,
        )) as VerifyInviteResponse;

        if (!verifyResponse.data.success) {
          setStatus("error");
          setMessage("Invitation verification failed");
          setErrorDetails(
            verifyResponse.data.message || "Unknown error occurred",
          );
          return;
        }

        const workspaceId = verifyResponse.data.data?.workspaceId;

        if (!workspaceId) {
          setStatus("error");
          setMessage("Invitation verification failed");
          setErrorDetails(
            "Workspace information is missing from the response.",
          );
          return;
        }

        saveInvitationToken(token);
        setInvitationFlag(true);
        savePendingWorkspaceId(workspaceId);

        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          setMessage("Accepting invitation...");

          try {
            await workspaceApi.acceptInvite(token);
            setStatus("success");
            setMessage("Invitation accepted successfully!");

            setTimeout(() => {
              router.push(`/workspace/${workspaceId}`);
            }, 1000);
          } catch (acceptError: unknown) {
            setStatus("error");
            setMessage("Failed to accept invitation");
            setErrorDetails(
              getErrorMessage(acceptError, "Could not accept the invitation"),
            );
            clearInvitationData();
          }
        } else {
          setStatus("success");
          setMessage("Redirecting to login...");

          setTimeout(() => {
            router.push("/auth/login");
          }, 1500);
        }
      } catch (error: unknown) {
        setStatus("error");
        setMessage("Verification failed");
        setErrorDetails(
          getErrorMessage(
            error,
            "The invitation link is invalid or has expired.",
          ),
        );
      }
    };

    verifyAndProcess();
  }, [token, router]);

  const goToLogin = () => {
    router.push("/auth/login");
  };

  return {
    status,
    message,
    errorDetails,
    goToLogin,
  };
}
