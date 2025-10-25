'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { IssueWithRelations } from '@/lib/types'
import { WorkflowState } from '@prisma/client'
import { IssueCard } from '@/components/issues/issue-card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'

interface IssueBoardProps {
  issues: IssueWithRelations[]
  workflowStates: WorkflowState[]
  onIssueClick?: (issue: IssueWithRelations) => void
  onIssueUpdate?: (issueId: string, updates: Partial<IssueWithRelations>) => void
  onIssueView?: (issue: IssueWithRelations) => void
  onIssueEdit?: (issue: IssueWithRelations) => void
  onIssueAssign?: (issue: IssueWithRelations) => void
  onIssueMove?: (issue: IssueWithRelations) => void
  onIssueDelete?: (issueId: string) => void
  teamId: string
  className?: string
}

export function IssueBoard({ 
  issues, 
  workflowStates, 
  onIssueClick, 
  onIssueUpdate,
  onIssueView,
  onIssueEdit,
  onIssueAssign,
  onIssueMove,
  onIssueDelete,
  teamId,
  className 
}: IssueBoardProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)

  const getIssuesByStatus = (statusId: string) => {
    return issues.filter(issue => issue.workflowStateId === statusId)
  }

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    
    const { destination, source, draggableId } = result

    // If dropped outside a droppable area
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const issueId = draggableId
    const newWorkflowStateId = destination.droppableId

    try {
      // Find the new workflow state object
      const newWorkflowState = workflowStates.find(state => state.id === newWorkflowStateId)
      
      // Optimistically update the UI with both workflowStateId and workflowState
      onIssueUpdate?.(issueId, { 
        workflowStateId: newWorkflowStateId,
        workflowState: newWorkflowState
      })

      // Update the issue in the database
      const response = await fetch(`/api/teams/${teamId}/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowStateId: newWorkflowStateId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update issue: ${response.status} ${response.statusText}`)
      }

      toast.success('Issue moved', 'Issue has been moved successfully.')
    } catch (error) {
      console.error('Error updating issue:', error)
      toast.error('Failed to move issue', 'Please try again.')
      
      // Revert the optimistic update on error
      const originalWorkflowStateId = source.droppableId
      const originalWorkflowState = workflowStates.find(state => state.id === originalWorkflowStateId)
      onIssueUpdate?.(issueId, { 
        workflowStateId: originalWorkflowStateId,
        workflowState: originalWorkflowState
      })
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className={`flex gap-6 overflow-x-auto pb-4 ${className}`}>
        {workflowStates.map((state) => {
          const stateIssues = getIssuesByStatus(state.id)
          
          return (
            <div key={state.id} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: state.color }}
                    />
                    <h3 className="font-medium text-foreground">{state.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground">
                    {stateIssues.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <Droppable droppableId={state.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] transition-colors duration-200 ${
                      snapshot.isDraggingOver 
                        ? 'bg-primary/5 rounded-lg border-2 border-dashed border-primary/20' 
                        : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {stateIssues.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                          {snapshot.isDraggingOver ? 'Drop here' : 'No issues'}
                        </div>
                      ) : (
                        stateIssues.map((issue, index) => (
                          <Draggable
                            key={issue.id}
                            draggableId={issue.id}
                            index={index}
                            isDragDisabled={isDragging}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform duration-200 ${
                                  snapshot.isDragging ? 'rotate-1 scale-105' : ''
                                }`}
                              >
                                <IssueCard
                                  issue={issue}
                                  onClick={() => onIssueClick?.(issue)}
                                  onView={onIssueView}
                                  onEdit={onIssueEdit}
                                  onAssign={onIssueAssign}
                                  onMove={onIssueMove}
                                  onDelete={onIssueDelete}
                                  isDragging={snapshot.isDragging}
                                  className={`cursor-pointer hover:shadow-sm ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
