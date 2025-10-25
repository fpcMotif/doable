'use client';

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack";
import { AlertCircle, BarChart3, FolderOpen, MapPin, Settings, Users, Workflow } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

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
  },
  {
    name: "Segments",
    href: "/segments",
    icon: Workflow,
    type: "item",
  },
  {
    name: "Regions",
    href: "/regions",
    icon: MapPin,
    type: "item",
  },
  {
    type: 'label',
    name: 'Settings',
  },
  {
    name: "Configuration",
    href: "/configuration",
    icon: Settings,
    type: "item",
  },
];

export default function Layout(props: { children: React.ReactNode }) {
  const params = useParams<{ teamId: string }>();
  const user = useUser({ or: 'redirect' });
  const team = user.useTeam(params.teamId);
  const router = useRouter();

  if (!team) {
    router.push('/dashboard');
    return null;
  }

  return (
    <SidebarLayout 
      items={navigationItems}
      basePath={`/dashboard/${team.id}`}
      sidebarTop={<SelectedTeamSwitcher 
        selectedTeam={team}
        urlMap={(team) => `/dashboard/${team.id}`}
      />}
      baseBreadcrumb={[{
        title: team.displayName,
        href: `/dashboard/${team.id}`,
      }]}
    >
      {props.children}
    </SidebarLayout>
  );
}