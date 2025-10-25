import { cn } from '@/lib/utils'
import { ProjectWithRelations } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, FolderOpen, TrendingUp } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithRelations
  onClick?: () => void
  className?: string
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'N/A'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'canceled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'canceled':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Color accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ 
          background: `linear-gradient(90deg, ${project.color || '#6366f1'}, ${project.color || '#6366f1'}40)`
        }}
      />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {project.icon && (
              <div className="text-2xl mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {project.icon}
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
                  {project.key}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant="outline"
            className={cn(
              'text-xs font-medium border',
              getStatusColor(project.status)
            )}
          >
            {project.status}
          </Badge>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-primary/10">
              <FolderOpen className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium">{project._count.issues}</span>
            <span className="text-xs">issues</span>
          </div>
          
          {project.lead && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Users className="h-3 w-3 text-blue-500" />
              </div>
              <span className="text-xs">Lead: {project.lead}</span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="font-medium">Active</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
