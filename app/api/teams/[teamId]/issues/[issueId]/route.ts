import { NextRequest, NextResponse } from 'next/server'
import { getIssueById, updateIssue, deleteIssue } from '@/lib/api/issues'
import { UpdateIssueData } from '@/lib/types'
import { getUserId, getUser } from "@/lib/auth-server-helpers"

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
    
    // Get current user info (parallel calls for speed)
    const [authResult, userResult] = await Promise.all([
      getUserId(),
      getUser()
    ])
    
    const userId = authResult
    const user = userResult
    
    // Set assignee name if assigneeId is being updated and is the current user
    let assigneeName: string | null = null
    if (body.assigneeId && body.assigneeId !== 'unassigned' && userId && userId === body.assigneeId && user) {
      assigneeName = user.name || user.email || 'Unknown'
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
