import { NextRequest, NextResponse } from 'next/server'
import { getIssueById, updateIssue, deleteIssue } from '@/lib/api/issues'
import { UpdateIssueData } from '@/lib/types'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params
    const issue = await getIssueById(teamId, issueId)

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params
    const body = await request.json()
    
    // Get assignee name from team members if assigneeId is being updated
    let assigneeName: string | null = null
    if (body.assigneeId && body.assigneeId !== 'unassigned') {
      const { userId } = await auth()
      const user = await currentUser()
      
      // Check if the assignee is the current user
      if (userId && userId === body.assigneeId && user) {
        assigneeName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown'
      } else {
        // Fetch team members to get the assignee's name
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/teams/${teamId}/members`)
          if (response.ok) {
            const members = await response.json()
            const assigneeMember = members.find((m: any) => m.id === body.assigneeId)
            if (assigneeMember) {
              assigneeName = assigneeMember.displayName
            }
          }
        } catch (error) {
          console.error('Error fetching assignee:', error)
        }
      }
    }

    const updateData: UpdateIssueData = {
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      workflowStateId: body.workflowStateId,
      assigneeId: body.assigneeId === 'unassigned' ? null : body.assigneeId,
      assignee: body.assigneeId === 'unassigned' ? null : assigneeName,
      priority: body.priority,
      estimate: body.estimate,
      labelIds: body.labelIds,
    }

    const issue = await updateIssue(teamId, issueId, updateData)
    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params
    await deleteIssue(teamId, issueId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting issue:', error)
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    )
  }
}
