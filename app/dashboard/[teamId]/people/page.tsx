"use client";

import { Mail, Trash2, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ToastContainer, useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type TeamMember = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
};

export default function PeoplePage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toasts, toast, removeToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/members`),
        fetch(`/api/teams/${teamId}/invitations`),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        setInvitations(invitationsData);
      }
    } catch (error: unknown) {
      logger.error("Error fetching people data", { error });
      toast.error("Failed to load data", "Please try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  // Add event listener to refresh people when chatbot invites team members
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener("refresh-people", handleRefresh);

    return () => {
      window.removeEventListener("refresh-people", handleRefresh);
    };
  }, [fetchData]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Invalid email", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        toast.success(
          "Invitation sent",
          "The invitation has been sent successfully."
        );
        setInviteEmail("");
        setInviteRole("developer");
        setInviteDialogOpen(false);
        await fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast.error(
        "Failed to send invitation",
        message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/invitations/${invitationId}/resend`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success(
          "Invitation resent",
          "The invitation has been resent successfully."
        );
      } else {
        throw new Error("Failed to resend invitation");
      }
    } catch (error: unknown) {
      logger.error("Error resending invitation", { error, invitationId });
      toast.error("Failed to resend invitation", "Please try again.");
    }
  };

  const handleRemoveInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/invitations/${invitationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success(
          "Invitation removed",
          "The invitation has been removed successfully."
        );
        await fetchData();
      } else {
        throw new Error("Failed to remove invitation");
      }
    } catch (error: unknown) {
      logger.error("Error removing invitation", { error, invitationId });
      toast.error("Failed to remove invitation", "Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">People</h1>
          <p className="text-muted-foreground text-sm">
            Manage team members and their roles
          </p>
        </div>
        <Button
          className="font-medium"
          onClick={() => setInviteDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Developer
        </Button>
      </div>

      {/* Invite Dialog */}
      {inviteDialogOpen && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Address
              </label>
              <Input
                className="h-11"
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="developer@example.com"
                type="email"
                value={inviteEmail}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select onValueChange={setInviteRole} value={inviteRole}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setInviteDialogOpen(false);
                  setInviteEmail("");
                  setInviteRole("developer");
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleInvite}
              >
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
            {isSubmitting && (
              <div className="flex items-center justify-center pt-2">
                <Spinner size="sm" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 min-h-[200px]">
              <div className="flex flex-col items-center space-y-4">
                <Spinner size="md" />
                <p className="text-muted-foreground">Loading members...</p>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No team members yet
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50"
                  key={member.id}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <UserAvatar name={member.userName} size="md" />
                    <div>
                      <div className="font-medium">{member.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.userEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs px-3 py-1 rounded-full font-medium",
                        member.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : member.role === "viewer"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                  key={invitation.id}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {invitation.role} • Invited{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleResendInvitation(invitation.id)}
                      size="sm"
                      variant="outline"
                    >
                      Resend
                    </Button>
                    <Button
                      onClick={() => handleRemoveInvitation(invitation.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ToastContainer onRemove={removeToast} toasts={toasts} />
    </div>
  );
}
