import { NextRequest, NextResponse } from 'next/server'
import { getIssues, createIssue, getIssueStats } from '@/lib/api/issues'
import { CreateIssueData } from '@/lib/types'
import { stackServerApp } from '@/stack'
import { db } from '@/lib/db'

// Helper function to ensure team exists in local database
async function ensureTeamExists(teamId: string) {
  let localTeam = await db.team.findUnique({
    where: { id: teamId }
  })

  if (!localTeam) {
    // Sync team from Stack Auth to local database
    const stackTeam = await stackServerApp.getTeam(teamId)
    if (!stackTeam) {
      throw new Error('Team not found in Stack Auth')
    }

    // Create team in local database
    localTeam = await db.team.create({
      data: {
        id: teamId,
        name: stackTeam.displayName,
        key: stackTeam.displayName.substring(0, 3).toUpperCase(),
      }
    })

    // Create default workflow states for the team
    const defaultWorkflowStates = [
      { name: 'Backlog', type: 'backlog', color: '#64748b', position: 0 },
      { name: 'Todo', type: 'unstarted', color: '#3b82f6', position: 1 },
      { name: 'In Progress', type: 'started', color: '#f59e0b', position: 2 },
      { name: 'Done', type: 'completed', color: '#10b981', position: 3 },
    ]

    await Promise.all(
      defaultWorkflowStates.map(state =>
        db.workflowState.create({
          data: {
            ...state,
            teamId: teamId,
          }
        })
      )
    )

    // Create default labels for the team
    const defaultLabels = [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#8b5cf6' },
      { name: 'Enhancement', color: '#06b6d4' },
      { name: 'Documentation', color: '#84cc16' },
    ]

    await Promise.all(
      defaultLabels.map(label =>
        db.label.create({
          data: {
            ...label,
            teamId: teamId,
          }
        })
      )
    )
  }

  return localTeam
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { teamId } = await params

    // Ensure team exists in local database
    await ensureTeamExists(teamId)

    // Parse filters from query params
    const filters = {
      status: searchParams.getAll('status'),
      assignee: searchParams.getAll('assignee'),
      project: searchParams.getAll('project'),
      label: searchParams.getAll('label'),
      priority: searchParams.getAll('priority'),
      search: searchParams.get('search') || undefined,
    }

    // Parse sort from query params
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'
    const sort = { field: sortField as any, direction: sortDirection }

    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getIssueStats(teamId)
      return NextResponse.json(stats)
    }

    const issues = await getIssues(teamId, filters, sort)
    return NextResponse.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const body = await request.json()
    
    // Get user info from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request })
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure team exists in local database
    await ensureTeamExists(teamId)

    const issueData: CreateIssueData = {
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      workflowStateId: body.workflowStateId,
      assigneeId: body.assigneeId,
      priority: body.priority || 'none',
      estimate: body.estimate,
      labelIds: body.labelIds,
    }

    const issue = await createIssue(
      teamId, 
      issueData, 
      user.id, 
      user.displayName || (user as any).email
    )
    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}
