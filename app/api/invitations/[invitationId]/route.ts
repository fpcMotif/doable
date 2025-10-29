import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params;
    const convex = getConvexClient();

    // Get invitation
    const invitations = await convex.query(api.invitations.listInvitations, {
      teamId: undefined,
    });

    const invitation = invitations.find((inv) => inv._id === invitationId);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Return invitation details (don't require auth for public access)
    return NextResponse.json({
      id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      createdAt: invitation._creationTime,
      expiresAt: invitation.expiresAt,
      teamId: invitation.teamId,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
