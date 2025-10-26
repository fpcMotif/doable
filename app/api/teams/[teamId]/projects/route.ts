import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject, getProjectStats } from '@/lib/api/projects'
import { CreateProjectData } from '@/lib/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)

    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getProjectStats(teamId)
      return NextResponse.json(stats)
    }

    const projects = await getProjects(teamId)
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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

    // Get the current user from Clerk
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure team exists in local database
    let localTeam = await db.team.findUnique({
      where: { id: teamId }
    })

    if (!localTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Get user display name from Clerk
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown'

    const projectData: CreateProjectData = {
      name: body.name,
      description: body.description,
      key: body.key,
      color: body.color || '#6366f1',
      icon: body.icon,
      leadId: body.leadId || userId,
      lead: userName,
    }

    const project = await createProject(teamId, projectData)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
