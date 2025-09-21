import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await DatabaseService.getTeams()
    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await DatabaseService.getUserByClerkId(userId)
    if (!user || !["admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const teamData = await request.json()
    const team = await DatabaseService.createTeam(teamData)

    // Log the creation
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "team_created",
      entityType: "team",
      entityId: team._id!,
      metadata: { name: team.name, leadId: team.leadId },
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
