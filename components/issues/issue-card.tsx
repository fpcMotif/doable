import { cn } from '@/lib/utils'
import { IssueWithRelations } from '@/lib/types'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Card } from '@/components/ui/card'
import { ActionsMenu, issueActions } from '@/components/shared/actions-menu'

interface IssueCardProps {
  issue: IssueWithRelations
  onClick?: () => void
  onView?: (issue: IssueWithRelations) => void
  onEdit?: (issue: IssueWithRelations) => void
  onAssign?: (issue: IssueWithRelations) => void
  onMove?: (issue: IssueWithRelations) => void
  onDelete?: (issueId: string) => void
  className?: string
  isDragging?: boolean
}

export function IssueCard({ 
  issue, 
  onClick, 
  onView,
  onEdit,
  onAssign,
  onMove,
  onDelete,
  className, 
  isDragging 
}: IssueCardProps) {
  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:bg-muted/50 border-border/50',
        isDragging && 'opacity-50',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with ID and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            </div>
            <span className="font-mono text-sm text-muted-foreground">
              {issue.team.key}-{issue.number}
            </span>
          </div>
          
          {/* Status Badge */}
          <div 
            className="text-xs px-2 py-1 rounded text-white font-medium"
            style={{ backgroundColor: issue.workflowState.color }}
          >
            {issue.workflowState.name}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
          {issue.title}
        </h3>

        {/* Footer with assignee and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {issue.assignee && (
              <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-xs text-white font-medium">
                {issue.assignee.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <ActionsMenu
              actions={[
                issueActions.view(() => onView?.(issue)),
                issueActions.edit(() => onEdit?.(issue)),
                issueActions.assign(() => onAssign?.(issue)),
                issueActions.move(() => onMove?.(issue)),
                issueActions.delete(() => onDelete?.(issue.id)),
              ]}
              trigger={
                <button
                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-muted-foreground">⋯</span>
                </button>
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
