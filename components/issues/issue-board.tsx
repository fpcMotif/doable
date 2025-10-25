'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { IssueWithRelations } from '@/lib/types'
import { WorkflowState } from '@prisma/client'
import { IssueCard } from '@/components/issues/issue-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'

interface IssueBoardProps {
  issues: IssueWithRelations[]
  workflowStates: WorkflowState[]
  onIssueClick?: (issue: IssueWithRelations) => void
  onIssueUpdate?: (issueId: string, updates: Partial<IssueWithRelations>) => void
  teamId: string
  className?: string
}

export function IssueBoard({ 
  issues, 
  workflowStates, 
  onIssueClick, 
  onIssueUpdate,
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
      // Optimistically update the UI
      onIssueUpdate?.(issueId, { workflowStateId: newWorkflowStateId })

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
      onIssueUpdate?.(issueId, { workflowStateId: originalWorkflowStateId })
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
        {workflowStates.map((state) => {
          const stateIssues = getIssuesByStatus(state.id)
          
          return (
            <div key={state.id} className="flex-shrink-0 w-80">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: state.color }}
                      />
                      {state.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stateIssues.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Droppable droppableId={state.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] transition-colors duration-200 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 dark:bg-blue-950/20 rounded-lg' 
                            : ''
                        }`}
                      >
                        <div className="space-y-3">
                          {stateIssues.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
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
                                      snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                    }`}
                                  >
                                    <IssueCard
                                      issue={issue}
                                      onClick={() => onIssueClick?.(issue)}
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
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
