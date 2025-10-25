import { cn } from '@/lib/utils'
import { ProjectWithRelations } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, FolderOpen } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithRelations
  onClick?: () => void
  className?: string
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card
      className={cn(
        'p-6 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {project.icon && (
              <div className="text-2xl">{project.icon}</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project.key}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            <span>{project._count.issues} issues</span>
          </div>
          {project.lead && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.lead}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Color indicator */}
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: project.color }}
        />
      </div>
    </Card>
  )
}
