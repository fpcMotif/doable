import { NextRequest, NextResponse } from 'next/server'
import { getUserId, getUser } from '@/lib/auth-server-helpers'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const userId = await getUserId()
    const user = await getUser()

    // Fetch team members from database
    const teamMembers = await db.teamMember.findMany({
      where: { teamId },
      orderBy: { createdAt: 'asc' },
    })

    // If no members exist, add current user as admin
    if (teamMembers.length === 0 && user) {
      const userName = user.name || user.email || 'Unknown'
      const userEmail = user.email || ''

      const newMember = await db.teamMember.create({
        data: {
          teamId,
          userId,
          userName,
          userEmail,
          role: 'admin',
        },
      })

      // Format for frontend
      const formattedMember = {
        id: newMember.id,
        userId: newMember.userId,
        userName: newMember.userName,
        userEmail: newMember.userEmail,
        displayName: newMember.userName,
        email: newMember.userEmail,
        role: newMember.role,
        profileImageUrl: user.image || undefined,
      }

      return NextResponse.json([formattedMember])
    }

    // Format members for the frontend
    const formattedMembers = teamMembers.map((member) => ({
      id: member.id,
      userId: member.userId,
      userName: member.userName,
      userEmail: member.userEmail,
      displayName: member.userName,
      email: member.userEmail,
      role: member.role,
      profileImageUrl: undefined, // Can be enhanced with Clerk user data
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
