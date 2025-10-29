"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function InvitePage({
  params,
}: {
  params: { invitationId: string };
}) {
  const [status, setStatus] = useState<
    "loading" | "accepting" | "success" | "error" | "not-found" | "expired"
  >("loading");
  const [error, setError] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${params.invitationId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setStatus("not-found");
          } else {
            setStatus("error");
            setError("Failed to load invitation");
          }
          return;
        }

        const data = await response.json();
        setTeamId(data.teamId);

        // Check if already accepted or expired
        if (data.status === "accepted") {
          setStatus("success");
          return;
        }

        if (new Date(data.expiresAt) < new Date()) {
          setStatus("expired");
          return;
        }

        setStatus("loading");
      } catch {
        setStatus("error");
        setError("Failed to load invitation");
      }
    };

    fetchInvitation();
  }, [params.invitationId]);

  const handleAccept = async () => {
    try {
      setStatus("accepting");

      const response = await fetch(
        `/api/teams/${teamId}/invitations/${params.invitationId}/accept`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setStatus("success");
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push(`/dashboard/${teamId}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setStatus("error");
        setError(errorData.error || "Failed to accept invitation");
      }
    } catch {
      setStatus("error");
      setError("Failed to accept invitation");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <Spinner size="md" />
                <p className="text-muted-foreground">Loading invitation...</p>
              </div>
            </div>
          )}

          {status === "accepting" && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <Spinner size="md" />
                <p className="text-muted-foreground">Accepting invitation...</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <h3 className="text-xl font-semibold">Invitation Accepted!</h3>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === "not-found" && (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-600" />
              <h3 className="text-xl font-semibold">Invitation Not Found</h3>
              <p className="text-muted-foreground">
                This invitation link is invalid or has been removed.
              </p>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
              <h3 className="text-xl font-semibold">Invitation Expired</h3>
              <p className="text-muted-foreground">
                This invitation has expired. Please ask for a new invitation.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {status === "loading" && teamId && (
            <div className="pt-4">
              <Button className="w-full" onClick={handleAccept} size="lg">
                Accept Invitation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
