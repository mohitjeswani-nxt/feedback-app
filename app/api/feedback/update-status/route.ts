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
    if (!user || !["team_member", "team_lead", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ticketId, status, resolutionText, preventiveMeasures, memberComments, daysTaken } = await request.json()

    if (!ticketId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updates: any = { status }

    if (status === "resolved" || status === "no_issue_found") {
      updates.resolutionText = resolutionText
      updates.preventiveMeasures = preventiveMeasures
      updates.memberComments = memberComments
      updates.daysTaken = daysTaken
      updates.actualResolutionDate = new Date()
      updates.leadApprovalStatus = "pending"
    }

    const success = await DatabaseService.updateFeedback(ticketId, updates)

    if (!success) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Create notification for team lead if resolution submitted
    if (status === "resolved" || status === "no_issue_found") {
      const feedback = await DatabaseService.getFeedbackByTicketId(ticketId)
      if (feedback?.assignedTeamId) {
        const team = await DatabaseService.getTeamById(feedback.assignedTeamId)
        if (team?.leadId) {
          await DatabaseService.createNotification({
            userId: team.leadId,
            type: "resolution_approved",
            title: "Resolution Submitted",
            message: `${user.name} has submitted a resolution for ${ticketId}`,
            feedbackId: ticketId,
            isRead: false,
          })
        }
      }
    }

    // Log the status update
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "feedback_status_updated",
      entityType: "feedback",
      entityId: ticketId,
      metadata: {
        oldStatus: "unknown", // Would need to fetch old status for complete audit
        newStatus: status,
        resolutionSubmitted: status === "resolved" || status === "no_issue_found",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating feedback status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
