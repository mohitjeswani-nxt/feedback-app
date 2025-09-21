import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templates = await DatabaseService.getFormTemplates()
    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching form templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await DatabaseService.getUserByClerkId(userId)
    if (!user || !["admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const templateData = await request.json()

    const template = await DatabaseService.createFormTemplate({
      ...templateData,
      createdBy: userId,
      version: 1,
    })

    // Log the creation
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "form_template_created",
      entityType: "form_template",
      entityId: template._id!,
      metadata: { programType: template.programType, name: template.name },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error creating form template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
