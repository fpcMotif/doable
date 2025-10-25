'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Filter, X } from 'lucide-react'
import { IssueFilters } from '@/lib/types'
import { Project, WorkflowState, Label } from '@prisma/client'

interface FilterBarProps {
  filters: IssueFilters
  onFiltersChange: (filters: IssueFilters) => void
  projects: Project[]
  workflowStates: WorkflowState[]
  labels: Label[]
  className?: string
}

export function FilterBar({
  filters,
  onFiltersChange,
  projects,
  workflowStates,
  labels,
  className
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof IssueFilters, value: string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: keyof IssueFilters) => {
    onFiltersChange({
      ...filters,
      [key]: []
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      assignee: [],
      project: [],
      label: [],
      priority: [],
      search: undefined,
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined
    ).length
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
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
          {workflowStates.map((state) => (
            <DropdownMenuCheckboxItem
              key={state.id}
              checked={filters.status?.includes(state.id) || false}
              onCheckedChange={(checked) => {
                const currentStatuses = filters.status || []
                const newStatuses = checked
                  ? [...currentStatuses, state.id]
                  : currentStatuses.filter(id => id !== state.id)
                updateFilter('status', newStatuses)
              }}
            >
              {state.name}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuCheckboxItem
              key={project.id}
              checked={filters.project?.includes(project.id) || false}
              onCheckedChange={(checked) => {
                const currentProjects = filters.project || []
                const newProjects = checked
                  ? [...currentProjects, project.id]
                  : currentProjects.filter(id => id !== project.id)
                updateFilter('project', newProjects)
              }}
            >
              {project.name}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          {[
            { value: 'none', label: 'None' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ].map((priority) => (
            <DropdownMenuCheckboxItem
              key={priority.value}
              checked={filters.priority?.includes(priority.value) || false}
              onCheckedChange={(checked) => {
                const currentPriorities = filters.priority || []
                const newPriorities = checked
                  ? [...currentPriorities, priority.value]
                  : currentPriorities.filter(p => p !== priority.value)
                updateFilter('priority', newPriorities)
              }}
            >
              {priority.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Labels</DropdownMenuLabel>
          {labels.map((label) => (
            <DropdownMenuCheckboxItem
              key={label.id}
              checked={filters.label?.includes(label.id) || false}
              onCheckedChange={(checked) => {
                const currentLabels = filters.label || []
                const newLabels = checked
                  ? [...currentLabels, label.id]
                  : currentLabels.filter(id => id !== label.id)
                updateFilter('label', newLabels)
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
                onCheckedChange={clearAllFilters}
                className="text-red-600 focus:text-red-600"
              >
                Clear all filters
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.status?.map((statusId) => {
            const state = workflowStates.find(s => s.id === statusId)
            return state ? (
              <Badge key={statusId} variant="secondary" className="text-xs">
                {state.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => clearFilter('status')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          
          {filters.project?.map((projectId) => {
            const project = projects.find(p => p.id === projectId)
            return project ? (
              <Badge key={projectId} variant="secondary" className="text-xs">
                {project.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => clearFilter('project')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}

          {filters.priority?.map((priority) => (
            <Badge key={priority} variant="secondary" className="text-xs">
              {priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('priority')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.label?.map((labelId) => {
            const label = labels.find(l => l.id === labelId)
            return label ? (
              <Badge key={labelId} variant="secondary" className="text-xs">
                {label.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => clearFilter('label')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
