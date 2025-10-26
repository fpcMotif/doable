"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { TeamSelector } from "@/components/shared/team-selector";
import { DashboardLoader } from "@/components/ui/dashboard-loader";

export function PageClient() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Show loading while user is being fetched
  if (!isLoaded) {
    return <DashboardLoader message="Loading teams" submessage="Setting up your workspace..." />;
  }

  // For now, show team selector - this will need proper team fetching logic
  return <TeamSelector />;
}