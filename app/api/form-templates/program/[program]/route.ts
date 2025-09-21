import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function GET(request: Request, { params }: { params: { program: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const template = await DatabaseService.getFormTemplateByProgram(params.program)

    if (!template) {
      return NextResponse.json({ error: "Form template not found" }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error fetching form template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
