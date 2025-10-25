import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    // Get the current user from Stack Auth using the request object
    const user = await stackServerApp.getUser({ tokenStore: request })
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the team from Stack Auth
    const stackTeam = await stackServerApp.getTeam(teamId)
    if (!stackTeam) {
      return NextResponse.json(
        { error: 'Team not found in Stack Auth' },
        { status: 404 }
      )
    }

    // Check if team already exists in local database
    const existingTeam = await db.team.findUnique({
      where: { id: teamId }
    })

    if (existingTeam) {
      return NextResponse.json(existingTeam)
    }

    // Create team in local database
    const localTeam = await db.team.create({
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

    return NextResponse.json(localTeam, { status: 201 })
  } catch (error) {
    console.error('Error syncing team:', error)
    return NextResponse.json(
      { error: 'Failed to sync team' },
      { status: 500 }
    )
  }
}
