import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/db-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await DatabaseService.getUserByClerkId(userId);
    if (!user || !["team_lead", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ticketId, memberId, targetResolutionDate } = await request.json();

    if (!ticketId || !memberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const success = await DatabaseService.updateFeedback(ticketId, {
      assignedMemberId: memberId,
      status: "pending",
      targetResolutionDate: targetResolutionDate
        ? new Date(targetResolutionDate)
        : undefined,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Create notification for team member
    await DatabaseService.createNotification({
      userId: memberId,
      type: "feedback_assigned",
      title: "New Task Assigned",
      message: `Feedback ${ticketId} has been assigned to you`,
      read: false,
      priority: "high",
      updatedAt: new Date(),
    });

    // Log the assignment
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "feedback_assigned_to_member",
      entityType: "feedback",
      entityId: ticketId,
      metadata: { memberId, targetResolutionDate },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning feedback to member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
