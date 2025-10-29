"use client";

import type { Label, Project, WorkflowState } from "@prisma/client";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IssueFilters } from "@/lib/types";

type FilterBarProps = {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  projects: Project[];
  workflowStates: WorkflowState[];
  labels: Label[];
  className?: string;
};

export function FilterBar({
  filters,
  onFiltersChange,
  projects,
  workflowStates,
  labels,
  className,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof IssueFilters, value: string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof IssueFilters) => {
    onFiltersChange({
      ...filters,
      [key]: [],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      assignee: [],
      project: [],
      label: [],
      priority: [],
      search: undefined,
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) =>
      Array.isArray(value) ? value.length > 0 : value !== undefined
    ).length;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                variant="secondary"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          {workflowStates.map((state) => (
            <DropdownMenuCheckboxItem
              checked={filters.status?.includes(state.id) || false}
              key={state.id}
              onCheckedChange={(checked) => {
                const currentStatuses = filters.status || [];
                const newStatuses = checked
                  ? [...currentStatuses, state.id]
                  : currentStatuses.filter((id) => id !== state.id);
                updateFilter("status", newStatuses);
              }}
            >
              {state.name}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuCheckboxItem
              checked={filters.project?.includes(project.id) || false}
              key={project.id}
              onCheckedChange={(checked) => {
                const currentProjects = filters.project || [];
                const newProjects = checked
                  ? [...currentProjects, project.id]
                  : currentProjects.filter((id) => id !== project.id);
                updateFilter("project", newProjects);
              }}
            >
              {project.name}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          {[
            { value: "none", label: "None" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ].map((priority) => (
            <DropdownMenuCheckboxItem
              checked={filters.priority?.includes(priority.value) || false}
              key={priority.value}
              onCheckedChange={(checked) => {
                const currentPriorities = filters.priority || [];
                const newPriorities = checked
                  ? [...currentPriorities, priority.value]
                  : currentPriorities.filter((p) => p !== priority.value);
                updateFilter("priority", newPriorities);
              }}
            >
              {priority.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Labels</DropdownMenuLabel>
          {labels.map((label) => (
            <DropdownMenuCheckboxItem
              checked={filters.label?.includes(label.id) || false}
              key={label.id}
              onCheckedChange={(checked) => {
                const currentLabels = filters.label || [];
                const newLabels = checked
                  ? [...currentLabels, label.id]
                  : currentLabels.filter((id) => id !== label.id);
                updateFilter("label", newLabels);
              }}
            >
              {label.name}
            </DropdownMenuCheckboxItem>
          ))}

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={false}
                className="text-red-600 focus:text-red-600"
                onCheckedChange={clearAllFilters}
              >
                Clear all filters
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <>
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {filters.status?.map((statusId) => {
              const state = workflowStates.find((s) => s.id === statusId);
              return state ? (
                <Badge className="text-xs" key={statusId} variant="secondary">
                  {state.name}
                  <Button
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter("status")}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}

            {filters.project?.map((projectId) => {
              const project = projects.find((p) => p.id === projectId);
              return project ? (
                <Badge className="text-xs" key={projectId} variant="secondary">
                  {project.name}
                  <Button
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter("project")}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}

            {filters.priority?.map((priority) => (
              <Badge className="text-xs" key={priority} variant="secondary">
                {priority}
                <Button
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => clearFilter("priority")}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}

            {filters.label?.map((labelId) => {
              const label = labels.find((l) => l.id === labelId);
              return label ? (
                <Badge className="text-xs" key={labelId} variant="secondary">
                  {label.name}
                  <Button
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter("label")}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
          </div>

          {/* Clear Filters Button */}
          <Button
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={clearAllFilters}
            size="sm"
            variant="outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
