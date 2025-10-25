'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IssueCard } from '@/components/issues/issue-card'
import { IssueDialog } from '@/components/issues/issue-dialog'
import { IssueBoard } from '@/components/issues/issue-board'
import { IssueTable } from '@/components/issues/issue-table'
import { ViewSwitcher } from '@/components/shared/view-switcher'
import { FilterBar } from '@/components/filters/filter-bar'
import { CommandPalette } from '@/components/shared/command-palette'
import { CreateIssueData, IssueFilters, IssueSort, ViewType} from '@/lib/types'
import { useCommandPalette, useCreateShortcut } from '@/lib/hooks/use-keyboard-shortcuts'
import { useToast } from '@/lib/hooks/use-toast'
import { ToastContainer } from '@/lib/hooks/use-toast'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { IssueCardSkeleton, TableSkeleton, BoardSkeleton } from '@/components/ui/skeletons'
import { Plus, Search, AlertTriangle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Issue {
  id: string
  title: string
  description?: string
  number: number
  priority: string
  team: { key: string }
  project?: { name: string; key: string } | null
  workflowState: { id: string; name: string; color: string }
  workflowStateId: string
  assignee?: string | null
  creator: string
  labels: Array<{ id: string; label: { id: string; name: string; color: string } }>
  comments: Array<{ id: string }>
  createdAt: string
}

interface Project {
  id: string
  name: string
  key: string
}

interface WorkflowState {
  id: string
  name: string
  type: string
  color: string
}

interface Label {
  id: string
  name: string
  color: string
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export default function IssuesPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId

  const [issues, setIssues] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [workflowStates, setWorkflowStates] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [filters, setFilters] = useState<IssueFilters>({})
  const [sort, setSort] = useState<IssueSort>({ field: 'createdAt', direction: 'desc' })
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Toast notifications
  const { toasts, toast, removeToast } = useToast()

  // Keyboard shortcuts
  useCommandPalette(() => setCommandPaletteOpen(true))
  useCreateShortcut(() => setCreateDialogOpen(true))

  // Memoized cache keys
  const cacheKeys = useMemo(() => ({
    projects: `projects-${teamId}`,
    workflowStates: `workflowStates-${teamId}`,
    labels: `labels-${teamId}`,
    issues: `issues-${teamId}-${JSON.stringify(filters)}-${JSON.stringify(sort)}`
  }), [teamId, filters, sort])

  useEffect(() => {
    fetchInitialData()
  }, [teamId])

  useEffect(() => {
    fetchIssues()
  }, [teamId, filters, sort])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedProjects = getCachedData(cacheKeys.projects)
      const cachedWorkflowStates = getCachedData(cacheKeys.workflowStates)
      const cachedLabels = getCachedData(cacheKeys.labels)

      if (cachedProjects && cachedWorkflowStates && cachedLabels) {
        setProjects(cachedProjects)
        setWorkflowStates(cachedWorkflowStates)
        setLabels(cachedLabels)
        setLoading(false)
        return
      }

      // Fetch data in parallel
      const [projectsRes, workflowStatesRes, labelsRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/projects`),
        fetch(`/api/teams/${teamId}/workflow-states`),
        fetch(`/api/teams/${teamId}/labels`),
      ])

      if (!projectsRes.ok || !workflowStatesRes.ok || !labelsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [projectsData, workflowStatesData, labelsData] = await Promise.all([
        projectsRes.json(),
        workflowStatesRes.json(),
        labelsRes.json(),
      ])

      // Cache the data
      setCachedData(cacheKeys.projects, projectsData)
      setCachedData(cacheKeys.workflowStates, workflowStatesData)
      setCachedData(cacheKeys.labels, labelsData)

      setProjects(projectsData as any)
      setWorkflowStates(workflowStatesData as any)
      setLabels(labelsData as any)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data. Please try again.')
      toast.error('Failed to load data', 'Please refresh the page and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchIssues = async () => {
    try {
      setIssuesLoading(true)
      
      // Check cache first
      const cachedIssues = getCachedData(cacheKeys.issues)
      if (cachedIssues) {
        setIssues(cachedIssues)
        setIssuesLoading(false)
        return
      }

      const searchParams = new URLSearchParams()
      
      // Add filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value) {
          searchParams.append(key, value as string)
        }
      })
      
      // Add sort to search params
      searchParams.append('sortField', sort.field)
      searchParams.append('sortDirection', sort.direction)

      const response = await fetch(`/api/teams/${teamId}/issues?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch issues')
      }
      
      const data = await response.json()
      
      // Cache the issues
      setCachedData(cacheKeys.issues, data)
      setIssues(data)
    } catch (error) {
      console.error('Error fetching issues:', error)
      toast.error('Failed to load issues', 'Please try again.')
    } finally {
      setIssuesLoading(false)
    }
  }

  const handleCreateIssue = async (data: CreateIssueData) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newIssue = await response.json()
        setIssues(prev => [newIssue, ...prev])
        
        // Clear issues cache to force refresh
        cache.delete(cacheKeys.issues)
        
        toast.success('Issue created', 'Your issue has been created successfully.')
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create issue')
      }
    } catch (error) {
      console.error('Error creating issue:', error)
      toast.error('Failed to create issue', 'Please try again.')
      throw error
    }
  }

  const handleFiltersChange = (newFilters: IssueFilters) => {
    setFilters(newFilters)
    // Also update search query if it's in the filters
    if (newFilters.search !== undefined) {
      setSearchQuery(newFilters.search)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setFilters(prev => ({
      ...prev,
      search: value
    }))
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort({ field: field as any, direction })
  }

  // Apply client-side search filtering to API-filtered results
  const filteredIssues = issues.filter(issue => {
    // If there's a search query, apply client-side search filtering
    if (searchQuery) {
      return issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    // Otherwise, return all issues (they're already filtered by API)
    return true
  })

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-3">Something went wrong</h3>
            <p className="text-body-medium text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="font-medium"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight">Issues</h1>
          <p className="text-muted-foreground text-body-medium">Manage and track your team&apos;s issues</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="font-medium"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium">Search & Filter</CardTitle>
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
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              projects={projects}
              workflowStates={workflowStates}
              labels={labels}
            />
          </div>
        </CardContent>
      </Card>

        {/* Issues Display */}
        <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Loading dashboard...</span>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-16">
              <div className="text-muted-foreground">
                {searchQuery || Object.values(filters).some(value => 
                  Array.isArray(value) ? value.length > 0 : value !== '' && value !== undefined
                ) ? (
                  <>
                    <p className="text-xl font-medium text-foreground mb-2">No issues found</p>
                    <p className="text-body-medium mb-4">Try adjusting your search terms or filters</p>
                    <Button 
                      variant="outline"
                      className="font-medium" 
                      onClick={() => {
                        setSearchQuery('')
                        setFilters({})
                      }}
                    >
                      Clear all filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-medium text-foreground mb-2">No issues yet</p>
                    <p className="text-body-medium mb-6">Create your first issue to get started</p>
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
                {currentView === 'list' && (
                  <div className="grid gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <IssueCardSkeleton key={i} />
                    ))}
                  </div>
                )}
                {currentView === 'board' && <BoardSkeleton />}
                {currentView === 'table' && <TableSkeleton />}
              </>
            ) : (
              <>
                {currentView === 'list' && (
                  <div className="grid gap-4">
                    {filteredIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue as any}
                        onClick={() => {
                          // TODO: Navigate to issue detail
                          console.log('Navigate to issue:', issue.id)
                        }}
                      />
                    ))}
                  </div>
                )}

                {currentView === 'board' && (
                  <IssueBoard
                    issues={filteredIssues as any}
                    workflowStates={workflowStates}
                    teamId={teamId}
                    onIssueClick={(issue) => {
                      // TODO: Navigate to issue detail
                      console.log('Navigate to issue:', issue.id)
                    }}
                    onIssueUpdate={(issueId, updates) => {
                      setIssues(prev => 
                        prev.map(issue => 
                          issue.id === issueId 
                            ? { ...issue, ...updates } as any
                            : issue
                        )
                      )
                    }}
                  />
                )}

                {currentView === 'table' && (
                  <IssueTable
                    issues={filteredIssues as any}
                    workflowStates={workflowStates}
                    projects={projects}
                    onIssueClick={(issue) => {
                      // TODO: Navigate to issue detail
                      console.log('Navigate to issue:', issue.id)
                    }}
                    onSort={handleSort}
                    sortField={sort.field}
                    sortDirection={sort.direction}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create Issue Dialog */}
      <IssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (data: any) => {
          await handleCreateIssue(data)
        }}
        projects={projects}
        workflowStates={workflowStates}
        labels={labels}
        title="Create Issue"
        description="Create a new issue for your team."
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        teamId={teamId}
        onCreateIssue={() => setCreateDialogOpen(true)}
        onCreateProject={() => {
          // TODO: Navigate to projects page and open create dialog
          console.log('Navigate to projects and create')
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  )
}