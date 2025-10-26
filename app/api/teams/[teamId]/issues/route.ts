import { NextRequest, NextResponse } from 'next/server'
import { getIssues, createIssue, getIssueStats } from '@/lib/api/issues'
import { CreateIssueData } from '@/lib/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Cache for team existence checks
const teamExistsCache = new Set<string>()

// Helper function to ensure team exists in local database
async function ensureTeamExists(teamId: string) {
  // Check cache first
  if (teamExistsCache.has(teamId)) {
    return { id: teamId }
  }

  const localTeam = await db.team.findUnique({
    where: { id: teamId }
  })

  if (!localTeam) {
    throw new Error('Team not found')
  }

  // Cache the team existence
  teamExistsCache.add(teamId)
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
    
    // Get user info from Clerk (parallel calls for speed)
    const [authResult, userResult] = await Promise.all([
      auth(),
      currentUser()
    ])
    
    const { userId } = authResult
    const user = userResult
    
    if (!userId || !user) {
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
      userId, 
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown'
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
