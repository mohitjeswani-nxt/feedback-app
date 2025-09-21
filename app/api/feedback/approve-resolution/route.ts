import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await DatabaseService.getUserByClerkId(userId)
    if (!user || !["team_lead", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ticketId, approved, leadComments, reassignTo } = await request.json()

    if (!ticketId || approved === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updates: any = {
      leadApprovalStatus: approved ? "approved" : "rejected",
      leadComments,
    }

    if (approved) {
      updates.status = "completed"
      updates.completedAt = new Date()
    } else {
      updates.status = "pending"
      if (reassignTo) {
        updates.assignedMemberId = reassignTo
      }
    }

    const success = await DatabaseService.updateFeedback(ticketId, updates)

    if (!success) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Create notification for team member
    const feedback = await DatabaseService.getFeedbackByTicketId(ticketId)
    if (feedback?.assignedMemberId) {
      await DatabaseService.createNotification({
        userId: feedback.assignedMemberId,
        type: approved ? "resolution_approved" : "resolution_rejected",
        title: approved ? "Resolution Approved" : "Resolution Rejected",
        message: approved
          ? `Your resolution for ${ticketId} has been approved`
          : `Your resolution for ${ticketId} has been rejected. Please review and resubmit.`,
        feedbackId: ticketId,
        isRead: false,
      })
    }

    // Log the approval/rejection
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: approved ? "resolution_approved" : "resolution_rejected",
      entityType: "feedback",
      entityId: ticketId,
      metadata: {
        leadComments,
        reassignTo: reassignTo || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving/rejecting resolution:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
