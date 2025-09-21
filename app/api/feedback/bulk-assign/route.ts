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
    if (!user || !["auditor", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ticketIds, teamId, podId, priority, kpiCategory, slaHours } = await request.json()

    if (!ticketIds?.length || !teamId || !priority || !slaHours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const assignedAt = new Date()
    const slaDeadline = new Date(assignedAt.getTime() + slaHours * 60 * 60 * 1000)

    const results = await Promise.all(
      ticketIds.map(async (ticketId: string) => {
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
        })

        if (success) {
          // Log the assignment
          await DatabaseService.createAuditLog({
            userId,
            userRole: user.role,
            action: "feedback_bulk_assigned",
            entityType: "feedback",
            entityId: ticketId,
            metadata: {
              teamId,
              podId,
              priority,
              kpiCategory,
              slaHours,
              bulkOperation: true,
            },
          })
        }

        return { ticketId, success }
      }),
    )

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    // Create notification for team lead
    const team = await DatabaseService.getTeamById(teamId)
    if (team?.leadId && successCount > 0) {
      await DatabaseService.createNotification({
        userId: team.leadId,
        type: "feedback_assigned",
        title: "Bulk Feedback Assignment",
        message: `${successCount} feedback items have been assigned to your team`,
        isRead: false,
      })
    }

    return NextResponse.json({
      success: true,
      assigned: successCount,
      failed: failureCount,
      results,
    })
  } catch (error) {
    console.error("Error bulk assigning feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
