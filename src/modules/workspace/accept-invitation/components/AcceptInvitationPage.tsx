"use client";

import { memo } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import useAcceptInvitation from "@/modules/workspace/accept-invitation/hooks/useAcceptInvitation";
import { Button, Card, CardContent } from "@/shared/components/ui";

interface AcceptInvitationPageProps {
  token: string;
}

const AcceptInvitationPage = memo(function AcceptInvitationPage({
  token,
}: AcceptInvitationPageProps) {
  const { status, message, errorDetails, goToLogin } =
    useAcceptInvitation(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-border">
        <CardContent className="p-8 text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-foreground" />
              <h2 className="text-xl font-semibold">{message}</h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your invitation...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-600">
                {message}
              </h2>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive">
                {message}
              </h2>
              {errorDetails && (
                <p className="text-sm text-muted-foreground">{errorDetails}</p>
              )}
              <Button onClick={goToLogin} className="mt-4">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default AcceptInvitationPage;
