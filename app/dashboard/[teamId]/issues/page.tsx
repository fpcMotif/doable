'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Search, AlertTriangle } from 'lucide-react'
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

export default function IssuesPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId

  const [issues, setIssues] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [workflowStates, setWorkflowStates] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchData()
  }, [teamId])

  useEffect(() => {
    fetchIssues()
  }, [teamId, filters, sort])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
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
      setIssues(data)
    } catch (error) {
      console.error('Error fetching issues:', error)
      toast.error('Failed to load issues', 'Please try again.')
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
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort({ field: field as any, direction })
  }

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
        <div>
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-gray-600">Manage and track your team&apos;s issues</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
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
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                {searchQuery ? (
                  <>
                    <p className="text-lg font-medium">No issues found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">No issues yet</p>
                    <p className="text-sm">Create your first issue to get started</p>
                    <Button 
                      className="mt-4" 
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
            {loading ? (
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