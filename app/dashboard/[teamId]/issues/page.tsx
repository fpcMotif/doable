"use client";

import { AlertTriangle, Plus, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "@/components/filters/filter-bar";
import { IssueBoard } from "@/components/issues/issue-board";
import { IssueCard } from "@/components/issues/issue-card";
import { IssueDialog } from "@/components/issues/issue-dialog";
import { IssueTable } from "@/components/issues/issue-table";
import { CommandPalette } from "@/components/shared/command-palette";
import { ViewSwitcher } from "@/components/shared/view-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  BoardSkeleton,
  IssueCardSkeleton,
  TableSkeleton,
} from "@/components/ui/skeletons";
import { Spinner } from "@/components/ui/spinner";
import {
  useCommandPalette,
  useCreateShortcut,
} from "@/lib/hooks/use-keyboard-shortcuts";
import { ToastContainer, useToast } from "@/lib/hooks/use-toast";
import type {
  CreateIssueData,
  IssueFilters,
  IssueSort,
  IssueWithRelations,
  ViewType,
} from "@/lib/types";


type Project = {
  id: string;
  name: string;
  key: string;
};

type WorkflowState = {
  id: string;
  name: string;
  type: string;
  color: string;
};

type Label = {
  id: string;
  name: string;
  color: string;
};

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function clearAllCachedData() {
  cache.clear();
}

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export default function IssuesPage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;

  const [issues, setIssues] = useState<IssueWithRelations[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogOpenForAssign, setEditDialogOpenForAssign] = useState(false);
  const [editDialogOpenForMove, setEditDialogOpenForMove] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<IssueWithRelations | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [filters, setFilters] = useState<IssueFilters>({});
  const [sort, setSort] = useState<IssueSort>({
    field: "createdAt",
    direction: "desc",
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toast notifications
  const { toasts, toast, removeToast } = useToast();

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const checkSidebarState = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sidebar-collapsed");
        setSidebarCollapsed(saved === "true");
      }
    };

    checkSidebarState();

    const interval = setInterval(checkSidebarState, 100);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedProjects = getCachedData(cacheKeys.projects);
      const cachedWorkflowStates = getCachedData(cacheKeys.workflowStates);
      const cachedLabels = getCachedData(cacheKeys.labels);

      if (cachedProjects && cachedWorkflowStates && cachedLabels) {
        setProjects(cachedProjects);
        setWorkflowStates(cachedWorkflowStates);
        setLabels(cachedLabels);
        setLoading(false);
        return;
      }

      // Fetch data in parallel
      const [projectsRes, workflowStatesRes, labelsRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/projects`),
        fetch(`/api/teams/${teamId}/workflow-states`),
        fetch(`/api/teams/${teamId}/labels`),
      ]);

      if (!projectsRes.ok || !workflowStatesRes.ok || !labelsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [projectsData, workflowStatesData, labelsData] = await Promise.all([
        projectsRes.json(),
        workflowStatesRes.json(),
        labelsRes.json(),
      ]);

      // Cache the data
      setCachedData(cacheKeys.projects, projectsData);
      setCachedData(cacheKeys.workflowStates, workflowStatesData);
      setCachedData(cacheKeys.labels, labelsData);

      setProjects(projectsData as Project[]);
      setWorkflowStates(workflowStatesData as WorkflowState[]);
      setLabels(labelsData as Label[]);
    } catch {
      setError("Failed to load data. Please try again.");
      toast.error(
        "Failed to load data",
        "Please refresh the page and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setIssuesLoading(true);

      // Check cache first
      const cachedIssues = getCachedData(cacheKeys.issues);
      if (cachedIssues) {
        setIssues(cachedIssues);
        setIssuesLoading(false);
        return;
      }

      const searchParams = new URLSearchParams();

      // Add filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value) {
          searchParams.append(key, value as string);
        }
      });

      // Add sort to search params
      searchParams.append("sortField", sort.field);
      searchParams.append("sortDirection", sort.direction);

      const response = await fetch(
        `/api/teams/${teamId}/issues?${searchParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }

      const data = await response.json();

      // Cache the issues
      setCachedData(cacheKeys.issues, data);
      setIssues(data);
    } catch {
      toast.error("Failed to load issues", "Please try again.");
    } finally {
      setIssuesLoading(false);
    }
  };

  // Keyboard shortcuts
  useCommandPalette(() => setCommandPaletteOpen(true));
  useCreateShortcut(() => setCreateDialogOpen(true));

  // Memoized cache keys
  const cacheKeys = useMemo(
    () => ({
      projects: `projects-${teamId}`,
      workflowStates: `workflowStates-${teamId}`,
      labels: `labels-${teamId}`,
      issues: `issues-${teamId}-${JSON.stringify(filters)}-${JSON.stringify(sort)}`,
    }),
    [teamId, filters, sort]
  );

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, filters, sort]);

  // Add event listener to refresh issues when chatbot creates/updates issues
  useEffect(() => {
    const handleRefresh = () => {
      clearAllCachedData();
      fetchIssues();
    };

    window.addEventListener("refresh-issues", handleRefresh);

    return () => {
      window.removeEventListener("refresh-issues", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const handleIssueView = (issue: IssueWithRelations) => {
    // For now, just open the edit dialog to view details
    setCurrentIssue(issue);
    setEditDialogOpen(true);
  };

  const handleIssueEdit = (issue: IssueWithRelations) => {
    setCurrentIssue(issue);
    setEditDialogOpen(true);
  };

  const handleIssueAssign = (issue: IssueWithRelations) => {
    setCurrentIssue(issue);
    setEditDialogOpenForAssign(true);
  };

  const handleIssueMove = (issue: IssueWithRelations) => {
    setCurrentIssue(issue);
    setEditDialogOpenForMove(true);
  };

  const handleIssueDelete = async (issueId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/issues/${issueId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIssues((prev) => prev.filter((i) => i.id !== issueId));
        toast.success(
          "Issue deleted",
          "The issue has been deleted successfully."
        );
      } else {
        throw new Error("Failed to delete issue");
      }
    } catch {
      toast.error("Failed to delete issue", "Please try again.");
    }
  };

  const handleIssueUpdate = async (data: Partial<UpdateIssueData>) => {
    if (!currentIssue) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teams/${teamId}/issues/${currentIssue.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) =>
          prev.map((i) => (i.id === currentIssue.id ? updatedIssue : i))
        );

        // Clear issues cache to force refresh
        cache.delete(cacheKeys.issues);

        toast.success(
          "Issue updated",
          "The issue has been updated successfully."
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update issue");
      }
    } catch (error) {
      toast.error("Failed to update issue", "Please try again.");
      throw error;
    }
  };

  const handleCreateIssue = async (data: CreateIssueData) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newIssue = await response.json();
        setIssues((prev) => [newIssue, ...prev]);

        // Clear issues cache to force refresh
        cache.delete(cacheKeys.issues);

        toast.success(
          "Issue created",
          "Your issue has been created successfully."
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create issue");
      }
    } catch (error) {
      toast.error("Failed to create issue", "Please try again.");
      throw error;
    }
  };

  const handleFiltersChange = (newFilters: IssueFilters) => {
    setFilters(newFilters);
    // Also update search query if it's in the filters
    if (newFilters.search !== undefined) {
      setSearchQuery(newFilters.search);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSort({ field: field as keyof IssueWithRelations, direction });
  };

  // Apply client-side search filtering to API-filtered results
  const filteredIssues = issues.filter((issue) => {
    // If there's a search query, apply client-side search filtering
    if (searchQuery) {
      return (
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Otherwise, return all issues (they're already filtered by API)
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

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
    // Reset to page 1 when filters or search change
    setCurrentPage(1);
  }, [filters, searchQuery]);

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
      <div className={`space-y-6 ${currentView === "board" ? "h-full" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Issues</h1>
            <p className="text-muted-foreground text-sm">
              Manage and track your team&apos;s issues
            </p>
          </div>
          <Button
            className="font-medium"
            disabled={loading}
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
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
                onViewChange={setCurrentView}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 h-11"
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search issues..."
                    value={searchQuery}
                  />
                </div>
              </div>
              <FilterBar
                filters={filters}
                labels={labels}
                onFiltersChange={handleFiltersChange}
                projects={projects}
                workflowStates={workflowStates}
              />
            </div>
          </CardContent>
        </Card>

        {/* Issues Display */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 min-h-[400px]">
              <div className="flex flex-col items-center space-y-4">
                <Spinner size="md" />
                <span className="text-muted-foreground">
                  Loading dashboard...
                </span>
              </div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="text-center py-16">
                <div className="text-muted-foreground">
                  {searchQuery ||
                  Object.values(filters).some((value) =>
                    Array.isArray(value)
                      ? value.length > 0
                      : value !== "" && value !== undefined
                  ) ? (
                    <>
                      <p className="text-xl font-medium text-foreground mb-2">
                        No issues found
                      </p>
                      <p className="text-body-medium mb-4">
                        Try adjusting your search terms or filters
                      </p>
                      <Button
                        className="font-medium"
                        onClick={() => {
                          setSearchQuery("");
                          setFilters({});
                        }}
                        variant="outline"
                      >
                        Clear all filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-medium text-foreground mb-2">
                        No issues yet
                      </p>
                      <p className="text-body-medium mb-6">
                        Create your first issue to get started
                      </p>
                      <Button
                        className="font-medium"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Issue
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {issuesLoading ? (
                <>
                  {currentView === "list" && (
                    <div className="grid gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <IssueCardSkeleton key={i} />
                      ))}
                    </div>
                  )}
                  {currentView === "board" && <BoardSkeleton />}
                  {currentView === "table" && <TableSkeleton />}
                </>
              ) : (
                <>
                  {currentView === "list" && (
                    <div className="grid gap-4">
                      {paginatedIssues.map((issue) => (
                        <IssueCard
                          issue={issue}
                          key={issue.id}
                          onAssign={handleIssueAssign}
                          onClick={() => {
                            handleIssueView(issue);
                          }}
                          onDelete={handleIssueDelete}
                          onEdit={handleIssueEdit}
                          onMove={handleIssueMove}
                          onView={handleIssueView}
                        />
                      ))}
                    </div>
                  )}

                  {currentView === "board" && (
                    <div className="w-full h-[calc(100vh-280px)] overflow-hidden">
                      <IssueBoard
                        className="h-full"
                        issues={filteredIssues}
                        onIssueAssign={handleIssueAssign}
                        onIssueClick={(issue) => {
                          handleIssueView(issue);
                        }}
                        onIssueDelete={handleIssueDelete}
                        onIssueEdit={handleIssueEdit}
                        onIssueMove={handleIssueMove}
                        onIssueUpdate={(issueId, updates) => {
                          setIssues((prev) =>
                            prev.map((issue) =>
                              issue.id === issueId
                                ? { ...issue, ...updates }
                                : issue
                            )
                          );
                        }}
                        onIssueView={handleIssueView}
                        sidebarCollapsed={sidebarCollapsed}
                        teamId={teamId}
                        workflowStates={workflowStates}
                      />
                    </div>
                  )}

                  {currentView === "table" && (
                    <IssueTable
                      issues={paginatedIssues}
                      onIssueClick={(issue) => {
                        handleIssueView(issue);
                      }}
                      onSort={handleSort}
                      projects={projects}
                      sortDirection={sort.direction}
                      sortField={sort.field}
                      workflowStates={workflowStates}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Pagination */}
          {filteredIssues.length > itemsPerPage && (
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

        {/* Create Issue Dialog */}
        <IssueDialog
          description="Create a new issue for your team."
          labels={labels}
          onOpenChange={setCreateDialogOpen}
          onSubmit={async (data: CreateIssueData) => {
            await handleCreateIssue(data);
          }}
          open={createDialogOpen}
          projects={projects}
          teamId={teamId}
          title="Create Issue"
          workflowStates={workflowStates}
        />

        {/* Edit Issue Dialog */}
        <IssueDialog
          description="Update the issue details."
          initialData={
            currentIssue
              ? {
                  title: currentIssue.title,
                  description: currentIssue.description ?? undefined,
                  projectId: currentIssue.project?.id,
                  workflowStateId: currentIssue.workflowStateId,
                  assigneeId: currentIssue.assignee || "",
                  priority: currentIssue.priority,
                  estimate: currentIssue.estimate ?? undefined,
                  labelIds: currentIssue.labels.map((l) => l.label.id),
                }
              : undefined
          }
          labels={labels}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setCurrentIssue(null);
            }
          }}
          onSubmit={async (data: CreateIssueData | UpdateIssueData) => {
            await handleIssueUpdate(data);
          }}
          open={editDialogOpen && !!currentIssue}
          projects={projects}
          teamId={teamId}
          title="Edit Issue"
          workflowStates={workflowStates}
        />

        {/* Assign Issue Dialog */}
        <IssueDialog
          description="Assign the issue to a team member."
          initialData={
            currentIssue
              ? {
                  title: currentIssue.title,
                  description: currentIssue.description ?? undefined,
                  projectId: currentIssue.project?.id,
                  workflowStateId: currentIssue.workflowStateId,
                  assigneeId: currentIssue.assignee || "",
                  priority: currentIssue.priority,
                  estimate: currentIssue.estimate ?? undefined,
                  labelIds: currentIssue.labels.map((l) => l.label.id),
                }
              : undefined
          }
          labels={labels}
          onOpenChange={(open) => {
            setEditDialogOpenForAssign(open);
            if (!open) {
              setCurrentIssue(null);
            }
          }}
          onSubmit={async (data: CreateIssueData | UpdateIssueData) => {
            await handleIssueUpdate(data);
          }}
          open={editDialogOpenForAssign && !!currentIssue}
          projects={projects}
          teamId={teamId}
          title="Assign Issue"
          workflowStates={workflowStates}
        />

        {/* Move Issue Dialog */}
        <IssueDialog
          description="Move the issue to a different project or status."
          initialData={
            currentIssue
              ? {
                  title: currentIssue.title,
                  description: currentIssue.description ?? undefined,
                  projectId: currentIssue.project?.id,
                  workflowStateId: currentIssue.workflowStateId,
                  assigneeId: currentIssue.assignee || "",
                  priority: currentIssue.priority,
                  estimate: currentIssue.estimate ?? undefined,
                  labelIds: currentIssue.labels.map((l) => l.label.id),
                }
              : undefined
          }
          labels={labels}
          onOpenChange={(open) => {
            setEditDialogOpenForMove(open);
            if (!open) {
              setCurrentIssue(null);
            }
          }}
          onSubmit={async (data: CreateIssueData | UpdateIssueData) => {
            await handleIssueUpdate(data);
          }}
          open={editDialogOpenForMove && !!currentIssue}
          projects={projects}
          teamId={teamId}
          title="Move Issue"
          workflowStates={workflowStates}
        />

        {/* Command Palette */}
        <CommandPalette
          onCreateIssue={() => setCreateDialogOpen(true)}
          onCreateProject={() => {
            window.location.href = `/dashboard/${teamId}/projects`;
          }}
          onOpenChange={setCommandPaletteOpen}
          open={commandPaletteOpen}
          teamId={teamId}
        />

        {/* Toast Notifications */}
        <ToastContainer onRemove={removeToast} toasts={toasts} />
      </div>
    </ErrorBoundary>
  );
}
