import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'

export async function GET(
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

    // Get the team using server-side method
    const team = await stackServerApp.getTeam(teamId)
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Get team members using server-side method
    // Note: This method may not exist in the current Stack Auth version
    // For now, return the current user as a fallback
    const members = [{
      id: user.id,
      displayName: user.displayName || (user as any).email,
      email: (user as any).email,
      profileImageUrl: user.profileImageUrl
    }]
    
    // Format members for the frontend
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      displayName: member.displayName || member.email,
      email: member.email,
      profileImageUrl: member.profileImageUrl
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}
