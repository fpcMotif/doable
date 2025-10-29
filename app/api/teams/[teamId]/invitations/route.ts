import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";
import { sendInvitationEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexClient();

    // Get pending invitations
    const allInvitations = await convex.query(api.invitations.listInvitations, {
      teamId: teamId as Id<"teams">,
    });

    // Filter pending and non-expired
    const now = Date.now();
    const invitations = allInvitations.filter(
      (inv) => inv.status === "pending" && inv.expiresAt > now
    );

    return NextResponse.json(invitations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const userId = await getUserId();
    const user = await getUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const convex = getConvexClient();

    // Check if user is team admin
    const members = await convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    });

    const inviter = members.find((m) => m.userId === userId);
    if (!inviter || inviter.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can invite members" },
        { status: 403 }
      );
    }

    // Check for existing member or pending invitation
    const existingMember = members.find((m) => m.userEmail === email);
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 }
      );
    }

    const existingInvitations = await convex.query(
      api.invitations.listInvitations,
      {
        teamId: teamId as Id<"teams">,
      }
    );

    const pendingInvitation = existingInvitations.find(
      (inv) =>
        inv.email === email &&
        inv.status === "pending" &&
        inv.expiresAt > Date.now()
    );

    if (pendingInvitation) {
      return NextResponse.json(
        { error: "An invitation is already pending for this email" },
        { status: 400 }
      );
    }

    // Set expiration to 7 days from now
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // Create invitation
    const invitationId = await convex.mutation(
      api.invitations.createInvitation,
      {
        teamId: teamId as Id<"teams">,
        email,
        role,
        invitedBy: userId,
        expiresAt,
      }
    );

    // Send invitation email
    const team = await convex.query(api.teams.getTeam, {
      teamId: teamId as Id<"teams">,
    });

    if (team) {
      await sendInvitationEmail({
        to: email,
        teamName: team.name,
        invitedBy: user.name || user.email || "A team member",
        invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationId}`,
      });
    }

    return NextResponse.json(
      { id: invitationId, message: "Invitation sent" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
