import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { displayName, profileImageUrl } = body

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      )
    }

    // Get the current user from Stack Auth using the request object
    const user = await stackServerApp.getUser({ tokenStore: request })
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create team using server-side method
    const team = await stackServerApp.createTeam({
      displayName,
      profileImageUrl: profileImageUrl || null,
    })

    // Add the current user to the team
    await team.addUser(user.id)

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
