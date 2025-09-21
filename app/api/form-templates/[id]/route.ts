import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updates = await request.json()
    const success = await DatabaseService.updateFormTemplate(params.id, updates)

    if (!success) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Log the update
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "form_template_updated",
      entityType: "form_template",
      entityId: params.id,
      metadata: updates,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating form template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const success = await DatabaseService.deleteFormTemplate(params.id)

    if (!success) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Log the deletion
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "form_template_deleted",
      entityType: "form_template",
      entityId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
