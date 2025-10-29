"use client";

import * as React from "react";
import { TeamSelector } from "@/components/shared/team-selector";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { authClient } from "@/lib/auth-client";

export function PageClient() {
  const { data: session, isPending } = authClient.useSession();

  // If loading, show loader
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader
          message="Loading teams"
          submessage="Setting up your workspace..."
        />
      </div>
    );
  }

  // If no session, middleware should redirect but show a message just in case
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  // User is authenticated, show team selector
  return <TeamSelector />;
}
