"use client";

import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ServerTeamCreator } from "./server-team-creator";

type TeamSelectorProps = {
  onCreateTeam?: () => void;
};

type Team = { id: string; name: string };

export function TeamSelector({
  onCreateTeam: _onCreateTeam,
}: TeamSelectorProps) {
  const t = useTranslations("teams");
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTeamCreator, setShowTeamCreator] = useState(false);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        setTeams([]);
      }
    } catch {
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSelectTeam = (teamId: string) => {
    router.push(`/dashboard/${teamId}/issues`);
  };

  const handleTeamCreated = async (team: { id?: string }) => {
    // Refresh the teams list to show the new team
    await fetchTeams();

    // If redirect didn't happen in ServerTeamCreator, navigate manually
    if (team?.id) {
      // Small delay to ensure state updates
      setTimeout(() => {
        router.push(`/dashboard/${team.id}/issues`);
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="md" />
              <p className="text-center text-muted-foreground">
                {t("loadingTeams")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {showTeamCreator ? (
          <ServerTeamCreator onTeamCreated={handleTeamCreated} />
        ) : (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                {t("noTeamsFound")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {t("noAccess")}
              </p>

              <Button
                className="w-full"
                onClick={() => setShowTeamCreator(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("createFirstTeam")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            {t("selectTeam")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{t("chooseTeam")}</p>

          <div className="space-y-2">
            {teams.map((team) => (
              <Button
                className="w-full justify-start h-auto p-4"
                key={team.id}
                onClick={() => handleSelectTeam(team.id)}
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("teamMembers")}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => setShowTeamCreator(true)}
            variant="ghost"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createNewTeam")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
