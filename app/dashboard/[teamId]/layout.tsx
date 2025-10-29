"use client";

import {
  AlertCircle,
  BarChart3,
  FolderOpen,
  MapPin,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ApiKeyDialog } from "@/components/shared/api-key-dialog";
import { WorkspaceSelector } from "@/components/shared/workspace-selector";
import SidebarLayout, { type SidebarItem } from "@/components/sidebar-layout";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { authClient } from "@/lib/auth-client";

export default function Layout(props: { children: React.ReactNode }) {
  const t = useTranslations("navigation");
  const dashboardT = useTranslations("dashboard");

  const navigationItems: SidebarItem[] = [
    {
      name: t("issues"),
      href: "/issues",
      icon: AlertCircle,
      type: "item",
    },
    {
      name: t("projects"),
      href: "/projects",
      icon: FolderOpen,
      type: "item",
    },
    {
      type: "label",
      name: t("management"),
    },
    {
      name: t("management"),
      href: "/management",
      icon: BarChart3,
      type: "item",
    },
    {
      name: t("people"),
      href: "/people",
      icon: Users,
      type: "item",
    },
    {
      name: t("apiKey"),
      icon: Settings,
      type: "item",
      action: () => setApiKeyDialogOpen(true),
    },
  ];

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const params = useParams<{ teamId: string }>();
  const { data: session } = authClient.useSession();
  const user = session?.user || null;
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Fetch team data
    const fetchTeam = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const teams = await response.json();
          const currentTeam = teams.find((t: any) => t.id === params.teamId);
          if (currentTeam) {
            setTeam(currentTeam);
          } else {
            // If team not found, redirect to dashboard immediately
            setIsRedirecting(true);
            setLoading(false);
            router.replace("/dashboard");
            return;
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching team:", error);
        setLoading(false);
        setIsRedirecting(true);
        router.replace("/dashboard");
      }
    };
    fetchTeam();
  }, [params.teamId, router]);

  // Don't render anything if redirecting
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader
          message={dashboardT("redirecting")}
          submessage={dashboardT("teamNotFound")}
        />
      </div>
    );
  }

  // Show loading while team is being fetched
  if (loading || !team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader
          message={dashboardT("loading")}
          submessage={dashboardT("loadingMessage")}
        />
      </div>
    );
  }

  return (
    <>
      <SidebarLayout
        baseBreadcrumb={[
          {
            title: team.displayName || team.name,
            href: `/dashboard/${team.id}`,
          },
        ]}
        basePath={`/dashboard/${team.id}`}
        items={navigationItems}
        sidebarTop={
          <WorkspaceSelector
            currentTeamId={team.id}
            currentTeamName={team.name}
          />
        }
        teamId={team.id}
      >
        {props.children}
      </SidebarLayout>

      {/* API Key Dialog */}
      <ApiKeyDialog
        onOpenChange={setApiKeyDialogOpen}
        open={apiKeyDialogOpen}
      />
    </>
  );
}
