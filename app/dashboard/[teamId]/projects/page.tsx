'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { CreateProjectData, UpdateProjectData } from '@/lib/types'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ProjectCardSkeleton } from '@/components/ui/skeletons'
import { useToast } from '@/lib/hooks/use-toast'
import { ToastContainer } from '@/lib/hooks/use-toast'
import { Plus, Search, Filter, AlertTriangle, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface Project {
  id: string
  name: string
  description?: string
  key: string
  color: string
  icon?: string
  status: string
  lead?: string | null
  createdAt: string
  _count: {
    issues: number
  }
}

interface ProjectFilters {
  status?: string[]
  lead?: string[]
  search?: string
}

export default function ProjectsPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [],
    lead: [],
    search: ''
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Toast notifications
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [teamId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/teams/${teamId}/projects`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects. Please try again.')
      toast.error('Failed to load projects', 'Please refresh the page and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (data: CreateProjectData | UpdateProjectData) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects(prev => [newProject, ...prev])
        toast.success('Project created', 'Your project has been created successfully.')
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project', 'Please try again.')
      throw error
    }
  }

  // Filter functions
  const updateFilter = (key: keyof ProjectFilters, value: string[] | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilter = (key: keyof ProjectFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'search' ? '' : []
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: [],
      lead: [],
      search: ''
    })
    setSearchQuery('')
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== '' && value !== undefined
    ).length
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  // Get unique leads from projects
  const uniqueLeads = Array.from(new Set(projects.map(p => p.lead).filter(Boolean))) as string[]

  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    // Search filter
    const searchMatch = !filters.search || 
      project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.key.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description?.toLowerCase().includes(filters.search.toLowerCase())

    // Status filter
    const statusMatch = !filters.status || filters.status.length === 0 || 
      filters.status.includes(project.status)

    // Lead filter
    const leadMatch = !filters.lead || filters.lead.length === 0 || 
      (project.lead && filters.lead.includes(project.lead))

    return searchMatch && statusMatch && leadMatch
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
          <h1 className="text-3xl font-light tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-body-medium">Manage your team&apos;s projects</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="font-medium">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  {['active', 'completed', 'canceled'].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={filters.status?.includes(status) || false}
                      onCheckedChange={(checked) => {
                        const currentStatuses = filters.status || []
                        const newStatuses = checked
                          ? [...currentStatuses, status]
                          : currentStatuses.filter(s => s !== status)
                        updateFilter('status', newStatuses)
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Lead</DropdownMenuLabel>
                  {uniqueLeads.map((lead) => (
                    <DropdownMenuCheckboxItem
                      key={lead}
                      checked={filters.lead?.includes(lead) || false}
                      onCheckedChange={(checked) => {
                        const currentLeads = filters.lead || []
                        const newLeads = checked
                          ? [...currentLeads, lead]
                          : currentLeads.filter(l => l !== lead)
                        updateFilter('lead', newLeads)
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
                        onCheckedChange={clearAllFilters}
                        className="text-red-600 focus:text-red-600"
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
              <div className="flex items-center gap-2 flex-wrap">
                {filters.status?.map((status) => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => clearFilter('status')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {filters.lead?.map((lead) => (
                  <Badge key={lead} variant="secondary" className="text-xs">
                    {lead}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => clearFilter('lead')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
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
                    <p className="text-xl font-medium text-foreground mb-2">No projects found</p>
                    <p className="text-body-medium mb-4">Try adjusting your search terms or filters</p>
                    <Button 
                      variant="outline"
                      className="font-medium" 
                      onClick={clearAllFilters}
                    >
                      Clear all filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-medium text-foreground mb-2">No projects yet</p>
                    <p className="text-body-medium mb-6">Create your first project to get started</p>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project as any}
                    onClick={() => {
                      // TODO: Navigate to project detail
                      console.log('Navigate to project:', project.id)
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Project Dialog */}
      <ProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProject}
        title="Create Project"
        description="Create a new project for your team."
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  )
}
