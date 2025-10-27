import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; invitationId: string }> }
) {
  try {
    const { teamId, invitationId } = await params
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get invitation details
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        teamId,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Extend expiration by 7 more days
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7)

    const updatedInvitation = await db.invitation.update({
      where: {
        id: invitationId,
        teamId,
      },
      data: {
        expiresAt: newExpiresAt,
      },
    })

    // Get team info for email
    const team = await db.team.findUnique({
      where: { id: teamId },
    })

    // Get inviter info
    const inviterName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress || 'Someone'

    // Resend invitation email
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/invite/${invitation.id}`

    if (process.env.RESEND_API_KEY) {
      try {
        await sendInvitationEmail({
          email: invitation.email,
          teamName: team?.name || 'the team',
          inviterName,
          role: invitation.role,
          inviteUrl,
        })
      } catch (emailError) {
        console.error('Error resending invitation email:', emailError)
        // Don't fail the resend if email fails
      }
    }

    return NextResponse.json(updatedInvitation)
  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }
}

