import { cn } from '@/lib/utils'
import { IssueWithRelations } from '@/lib/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityIcon } from '@/components/shared/priority-icon'
import { LabelBadge } from '@/components/shared/label-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Card } from '@/components/ui/card'
import { Calendar, MessageSquare, Clock } from 'lucide-react'

interface IssueCardProps {
  issue: IssueWithRelations
  onClick?: () => void
  className?: string
  isDragging?: boolean
}

export function IssueCard({ issue, onClick, className, isDragging }: IssueCardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        isDragging && 'opacity-50 scale-95',
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {issue.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
                {issue.team.key}-{issue.number}
              </span>
              {issue.project && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {issue.project.key}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PriorityIcon priority={issue.priority as any} />
            <StatusBadge status={issue.workflowState} />
          </div>
        </div>

        {/* Description */}
        {issue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        )}

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.slice(0, 2).map((issueLabel) => (
              <LabelBadge key={issueLabel.id} label={issueLabel.label} />
            ))}
            {issue.labels.length > 2 && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                +{issue.labels.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {issue.assignee && (
              <div className="flex items-center gap-2">
                <UserAvatar name={issue.assignee} size="sm" />
                <span className="text-xs text-muted-foreground">Assigned</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {issue.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{issue.comments.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
