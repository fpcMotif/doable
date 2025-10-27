'use client';

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { AlertCircle, BarChart3, FolderOpen, MapPin, Settings, Users, Workflow } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useParams, useRouter } from "next/navigation";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { WorkspaceSelector } from "@/components/shared/workspace-selector";
import { useState, useEffect } from "react";

const navigationItems: SidebarItem[] = [
  {
    name: "Issues",
    href: "/issues",
    icon: AlertCircle,
    type: "item",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderOpen,
    type: "item",
  },
  {
    type: 'label',
    name: 'Management',
  },
  {
    name: "Management",
    href: "/management",
    icon: BarChart3,
    type: "item",
  },
  {
    name: "People",
    href: "/people",
    icon: Users,
    type: "item",
  }
];

export default function Layout(props: { children: React.ReactNode }) {
  const params = useParams<{ teamId: string }>();
  const { data: session } = authClient.useSession();
  const user = session?.user || null;
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch team data
    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teams = await response.json();
          const currentTeam = teams.find((t: any) => t.id === params.teamId);
          if (currentTeam) {
            setTeam(currentTeam);
          } else {
            // If team not found, redirect to dashboard
            router.push('/dashboard');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team:', error);
        setLoading(false);
      }
    };
    fetchTeam();
  }, [params.teamId, router]);

  // Show loading while team is being fetched
  if (loading || !team) {
    return <DashboardLoader message="Loading team" submessage="Fetching team data..." />;
  }

  return (
    <SidebarLayout 
      items={navigationItems}
      basePath={`/dashboard/${team.id}`}
      sidebarTop={<WorkspaceSelector currentTeamId={team.id} currentTeamName={team.name} />}
      baseBreadcrumb={[{
        title: team.displayName || team.name,
        href: `/dashboard/${team.id}`,
      }]}
    >
      {props.children}
    </SidebarLayout>
  );
}