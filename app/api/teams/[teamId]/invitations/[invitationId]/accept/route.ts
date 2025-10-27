import { NextRequest, NextResponse } from 'next/server'
import { getUserId, getUser } from "@/lib/auth-server-helpers"
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; invitationId: string }> }
) {
  try {
    const { teamId, invitationId } = await params
    const userId = await getUserId()
    const user = await getUser()

    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find invitation
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

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Verify email matches
    const userEmail = user.email
    if (invitation.email !== userEmail) {
      return NextResponse.json(
        { error: 'Invitation email does not match your account' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (existingMember) {
      // Update invitation status
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      })

      return NextResponse.json({ success: true, message: 'Already a member' })
    }

    // Create team member
    const userName = user.name || user.email || 'Unknown'
    
    await db.teamMember.create({
      data: {
        teamId,
        userId,
        userName,
        userEmail: invitation.email,
        role: invitation.role,
      },
    })

    // Update invitation status
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: 'accepted' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}

