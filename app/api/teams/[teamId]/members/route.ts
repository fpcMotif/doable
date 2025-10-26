import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    // Get the current user from Clerk
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, return the current user as the only member
    // In production, integrate with Clerk Organizations API to get actual members
    const members = [{
      id: userId,
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
      email: user.emailAddresses[0]?.emailAddress || '',
      profileImageUrl: user.imageUrl || undefined
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
