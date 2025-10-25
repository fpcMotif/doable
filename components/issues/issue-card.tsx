import { cn } from '@/lib/utils'
import { IssueWithRelations } from '@/lib/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { PriorityIcon } from '@/components/shared/priority-icon'
import { LabelBadge } from '@/components/shared/label-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Card } from '@/components/ui/card'
import { Calendar, MessageSquare } from 'lucide-react'

interface IssueCardProps {
  issue: IssueWithRelations
  onClick?: () => void
  className?: string
  isDragging?: boolean
}

export function IssueCard({ issue, onClick, className, isDragging }: IssueCardProps) {
  const formatDate = (date: Date | string) => {
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {issue.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {issue.team.key}-{issue.number}
            </p>
          </div>
          <PriorityIcon priority={issue.priority as any} />
        </div>

        {/* Description */}
        {issue.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.labels.slice(0, 3).map((issueLabel) => (
              <LabelBadge key={issueLabel.id} label={issueLabel.label} />
            ))}
            {issue.labels.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{issue.labels.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.workflowState} />
            {issue.project && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {issue.project.key}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {issue.assignee && (
              <UserAvatar name={issue.assignee} size="sm" />
            )}
            {issue.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-3 w-3" />
                {issue.comments.length}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(issue.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
