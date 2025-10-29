"use client";

import { Columns, List, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewType } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewSwitcherProps = {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  views?: ViewType[];
  className?: string;
};

const viewConfig = {
  list: {
    label: "List",
    icon: List,
    description: "List view",
  },
  board: {
    label: "Board",
    icon: Columns,
    description: "Kanban board",
  },
  table: {
    label: "Table",
    icon: Table,
    description: "Table view",
  },
};

export function ViewSwitcher({
  currentView,
  onViewChange,
  views,
  className,
}: ViewSwitcherProps) {
  const availableViews = views || (Object.keys(viewConfig) as ViewType[]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {availableViews.map((view) => {
        const config = viewConfig[view];
        const Icon = config.icon;
        const isActive = currentView === view;

        return (
          <Button
            className={cn(
              "flex items-center gap-2",
              isActive && "bg-primary text-primary-foreground"
            )}
            key={view}
            onClick={() => onViewChange(view)}
            size="sm"
            title={config.description}
            variant={isActive ? "default" : "ghost"}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
