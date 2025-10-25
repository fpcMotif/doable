"use client";

import * as React from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { TeamSelector } from "@/components/shared/team-selector";

export function PageClient() {
  const router = useRouter();
  const user = useUser({ or: "redirect" });
  const teams = user.useTeams();

  React.useEffect(() => {
    if (teams.length > 0 && !user.selectedTeam) {
      user.setSelectedTeam(teams[0]);
    }
  }, [teams, user]);

  if (teams.length === 0) {
    return <TeamSelector />;
  } else if (user.selectedTeam) {
    router.push(`/dashboard/${user.selectedTeam.id}/issues`);
  }

  return null;
}