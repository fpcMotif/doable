"use client";

import { AlertTriangle, Filter, Plus, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectTable } from "@/components/projects/project-table";
import { ViewSwitcher } from "@/components/shared/view-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProjectCardSkeleton } from "@/components/ui/skeletons";
import { ToastContainer, useToast } from "@/lib/hooks/use-toast";
import type {
  CreateProjectData,
  ProjectWithRelations,
  UpdateProjectData,
} from "@/lib/types";

type ProjectFilters = {
  status?: string[];
  lead?: string[];
  search?: string;
};

export default function ProjectsPage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] =
    useState<ProjectWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "table">("list");
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [],
    lead: [],
    search: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Toast notifications
  const { toasts, toast, removeToast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teams/${teamId}/projects`);

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Add event listener to refresh projects when chatbot creates/updates projects
  useEffect(() => {
    const handleRefresh = () => {
      fetchProjects();
    };

    window.addEventListener("refresh-projects", handleRefresh);

    return () => {
      window.removeEventListener("refresh-projects", handleRefresh);
    };
  }, [fetchProjects]);

  const handleProjectEdit = (project: ProjectWithRelations) => {
    setCurrentProject(project);
    setEditDialogOpen(true);
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        toast.success(
          "Project deleted",
          "The project has been deleted successfully."
        );
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project", "Please try again.");
    }
  };

  const handleProjectDuplicate = async (project: ProjectWithRelations) => {
    try {
      const duplicateData: CreateProjectData = {
        name: `${project.name} (Copy)`,
        description: project.description ?? undefined,
        key: `${project.key}-COPY`,
        color: project.color,
        icon: project.icon ?? undefined,
        leadId: project.leadId ?? undefined,
      };

      const response = await fetch(`/api/teams/${teamId}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects((prev) => [newProject, ...prev]);
        toast.success(
          "Project duplicated",
          "The project has been duplicated successfully."
        );
      } else {
        throw new Error("Failed to duplicate project");
      }
    } catch (error) {
      console.error("Error duplicating project:", error);
      toast.error("Failed to duplicate project", "Please try again.");
    }
  };

  const handleProjectUpdate = async (
    data: CreateProjectData | UpdateProjectData
  ) => {
    if (!currentProject) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teams/${teamId}/projects/${currentProject.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === currentProject.id ? updatedProject : p))
        );
        toast.success(
          "Project updated",
          "The project has been updated successfully."
        );
      } else {
        throw new Error("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project", "Please try again.");
      throw error;
    }
  };

  const handleProjectArchive = async (projectId: string) => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "canceled" }),
        }
      );

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, status: "canceled" } : p
          )
        );
        toast.success(
          "Project archived",
          "The project has been archived successfully."
        );
      } else {
        throw new Error("Failed to archive project");
      }
    } catch (error) {
      console.error("Error archiving project:", error);
      toast.error("Failed to archive project", "Please try again.");
    }
  };

  const handleCreateProject = async (
    data: CreateProjectData | UpdateProjectData
  ) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects((prev) => [newProject, ...prev]);
        toast.success(
          "Project created",
          "Your project has been created successfully."
        );
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project", "Please try again.");
      throw error;
    }
  };

  // Filter functions
  const updateFilter = (
    key: keyof ProjectFilters,
    value: string[] | string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: keyof ProjectFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "search" ? "" : [],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: [],
      lead: [],
      search: "",
    });
    setSearchQuery("");
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) =>
      Array.isArray(value)
        ? value.length > 0
        : value !== "" && value !== undefined
    ).length;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  // Get unique leads from projects
  const uniqueLeads = Array.from(
    new Set(projects.map((p) => p.lead).filter(Boolean))
  ) as string[];

  // Filter projects based on current filters
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const searchMatch =
      !filters.search ||
      project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.key.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description?.toLowerCase().includes(filters.search.toLowerCase());

    // Status filter
    const statusMatch =
      !filters.status ||
      filters.status.length === 0 ||
      filters.status.includes(project.status);

    // Lead filter
    const leadMatch =
      !filters.lead ||
      filters.lead.length === 0 ||
      (project.lead && filters.lead.includes(project.lead));

    return searchMatch && statusMatch && leadMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages: Array<number | "ellipsis"> = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show current page and neighbors
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [filters]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-3">
              Something went wrong
            </h3>
            <p className="text-body-medium text-muted-foreground mb-6">
              {error}
            </p>
            <Button
              className="font-medium"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-light tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-body-medium">
              Manage your team&apos;s projects
            </p>
          </div>
          <Button
            className="font-medium"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium">
                Search & Filter
              </CardTitle>
              <ViewSwitcher
                currentView={currentView}
                onViewChange={(view) =>
                  setCurrentView(view as "list" | "table")
                }
                views={["list", "table"]}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10 h-11"
                      onChange={(e) => updateFilter("search", e.target.value)}
                      placeholder="Search projects..."
                      value={filters.search || ""}
                    />
                  </div>
                </div>
                <DropdownMenu
                  onOpenChange={setIsFilterOpen}
                  open={isFilterOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button className="font-medium" variant="outline">
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
                    {["active", "completed", "canceled"].map((status) => (
                      <DropdownMenuCheckboxItem
                        checked={filters.status?.includes(status) || false}
                        key={status}
                        onCheckedChange={(checked) => {
                          const currentStatuses = filters.status || [];
                          const newStatuses = checked
                            ? [...currentStatuses, status]
                            : currentStatuses.filter((s) => s !== status);
                          updateFilter("status", newStatuses);
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Lead</DropdownMenuLabel>
                    {uniqueLeads.map((lead) => (
                      <DropdownMenuCheckboxItem
                        checked={filters.lead?.includes(lead) || false}
                        key={lead}
                        onCheckedChange={(checked) => {
                          const currentLeads = filters.lead || [];
                          const newLeads = checked
                            ? [...currentLeads, lead]
                            : currentLeads.filter((l) => l !== lead);
                          updateFilter("lead", newLeads);
                        }}
                      >
                        {lead}
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
              </div>

              {/* Active filter badges */}
              {hasActiveFilters && (
                <>
                  <div className="flex items-center gap-1 flex-wrap flex-1">
                    {filters.status?.map((status) => (
                      <Badge
                        className="text-xs"
                        key={status}
                        variant="secondary"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <Button
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => clearFilter("status")}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}

                    {filters.lead?.map((lead) => (
                      <Badge className="text-xs" key={lead} variant="secondary">
                        {lead}
                        <Button
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => clearFilter("lead")}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
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
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="text-center py-16">
                <div className="text-muted-foreground">
                  {hasActiveFilters || filters.search ? (
                    <>
                      <p className="text-xl font-medium text-foreground mb-2">
                        No projects found
                      </p>
                      <p className="text-body-medium mb-4">
                        Try adjusting your search terms or filters
                      </p>
                      <Button
                        className="font-medium"
                        onClick={clearAllFilters}
                        variant="outline"
                      >
                        Clear all filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-medium text-foreground mb-2">
                        No projects yet
                      </p>
                      <p className="text-body-medium mb-6">
                        Create your first project to get started
                      </p>
                      <Button
                        className="font-medium"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {currentView === "list" && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {paginatedProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          onArchive={handleProjectArchive}
                          onDelete={handleProjectDelete}
                          onDuplicate={handleProjectDuplicate}
                          onEdit={handleProjectEdit}
                          project={project}
                        />
                      ))}
                    </div>
                  )}

                  {currentView === "table" && (
                    <ProjectTable
                      onProjectArchive={handleProjectArchive}
                      onProjectDelete={handleProjectDelete}
                      onProjectDuplicate={handleProjectDuplicate}
                      onProjectEdit={handleProjectEdit}
                      onProjectUpdate={(projectId, updates) => {
                        setProjects((prev) =>
                          prev.map((project) =>
                            project.id === projectId
                              ? { ...project, ...updates }
                              : project
                          )
                        );
                      }}
                      projects={paginatedProjects}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Pagination */}
          {filteredProjects.length > itemsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page as number);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Create Project Dialog */}
        <ProjectDialog
          description="Create a new project for your team."
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateProject}
          open={createDialogOpen}
          teamId={teamId}
          title="Create Project"
        />

        {/* Edit Project Dialog */}
        <ProjectDialog
          description="Update the project details."
          initialData={
            currentProject
              ? {
                  name: currentProject.name,
                  description: currentProject.description ?? undefined,
                  key: currentProject.key,
                  color: currentProject.color,
                  icon: currentProject.icon ?? undefined,
                  leadId: currentProject.leadId ?? undefined,
                  status: currentProject.status as any,
                }
              : undefined
          }
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setCurrentProject(null);
            }
          }}
          onSubmit={async (data) => {
            await handleProjectUpdate(data);
          }}
          open={editDialogOpen && !!currentProject}
          teamId={teamId}
          title="Edit Project"
        />

        {/* Toast Notifications */}
        <ToastContainer onRemove={removeToast} toasts={toasts} />
      </div>
    </ErrorBoundary>
  );
}
