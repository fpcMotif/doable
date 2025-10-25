import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject, getProjectStats } from '@/lib/api/projects'
import { CreateProjectData } from '@/lib/types'
import { stackServerApp } from '@/stack'
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

    // Get the current user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request })
    if (!user) {
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
      // Sync team from Stack Auth to local database
      const stackTeam = await stackServerApp.getTeam(teamId)
      if (!stackTeam) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        )
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

    const projectData: CreateProjectData = {
      name: body.name,
      description: body.description,
      key: body.key,
      color: body.color || '#6366f1',
      icon: body.icon,
      leadId: body.leadId,
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
