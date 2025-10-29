"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/lib/hooks/use-toast";

type ServerTeamCreatorProps = {
  onTeamCreated?: (team: unknown) => void;
};

export function ServerTeamCreator({ onTeamCreated }: ServerTeamCreatorProps) {
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: teamName.trim(),
        }),
      });

      if (response.ok) {
        const team = await response.json();
        toast.success(
          "Team created successfully!",
          "Your team has been created and you have been added as a member."
        );
        setTeamName("");
        onTeamCreated?.(team);

        // Redirect to the new team's dashboard
        if (team?.id) {
          window.location.href = `/dashboard/${team.id}/issues`;
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }
    } catch (error) {
      toast.error(
        "Failed to create team",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleCreateTeam}>
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              disabled={isCreating}
              id="teamName"
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
              value={teamName}
            />
          </div>
          <Button
            className="w-full"
            disabled={isCreating || !teamName.trim()}
            type="submit"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Creating Team...</span>
              </div>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </>
            )}
          </Button>
          {isCreating && (
            <div className="flex items-center justify-center pt-2">
              <Spinner size="sm" />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
