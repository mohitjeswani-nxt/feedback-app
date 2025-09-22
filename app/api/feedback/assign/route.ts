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
    if (!user || !["auditor", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ticketId, teamId, podId, priority, kpiCategory, slaHours } =
      await request.json();

    if (!ticketId || !teamId || !priority || !slaHours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const assignedAt = new Date();
    const slaDeadline = new Date(
      assignedAt.getTime() + slaHours * 60 * 60 * 1000
    );

    const success = await DatabaseService.updateFeedback(ticketId, {
      status: "assigned",
      assignedTeamId: teamId,
      assignedPodId: podId,
      priority,
      kpiCategory,
      slaHours,
      auditorId: userId,
      assignedAt,
      slaDeadline,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Create notification for team lead
    const team = await DatabaseService.getTeamById(teamId);
    if (team?.leadId) {
      await DatabaseService.createNotification({
        userId: team.leadId,
        type: "feedback_assigned",
        title: "New Feedback Assigned",
        message: `Feedback ${ticketId} has been assigned to your team`,
        read: false,
        priority: "high",
        updatedAt: new Date(),
      });
    }

    // Log the assignment
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "feedback_assigned",
      entityType: "feedback",
      entityId: ticketId,
      metadata: {
        teamId,
        podId,
        priority,
        kpiCategory,
        slaHours,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
