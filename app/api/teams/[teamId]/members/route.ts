import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();
    const user = await getUser();

    const convex = getConvexClient();

    // Fetch team members from Convex
    const teamMembers = await convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    });

    // If no members exist, add current user as admin
    if (teamMembers.length === 0 && user) {
      const userName = user.name || user.email || "Unknown";
      const userEmail = user.email || "";

      const newMemberId = await convex.mutation(api.teamMembers.addMember, {
        teamId: teamId as Id<"teams">,
        userId,
        userName,
        userEmail,
        role: "admin",
      });

      // Format for frontend
      const formattedMember = {
        id: newMemberId,
        userId,
        userName,
        userEmail,
        displayName: userName,
        email: userEmail,
        role: "admin",
        profileImageUrl: user.image || undefined,
      };

      return NextResponse.json([formattedMember]);
    }

    // Format members for the frontend
    const formattedMembers = teamMembers.map((member) => ({
      id: member._id,
      userId: member.userId,
      userName: member.userName,
      userEmail: member.userEmail,
      displayName: member.userName,
      email: member.userEmail,
      role: member.role,
      profileImageUrl: undefined, // Can be enhanced with Better Auth user data
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
