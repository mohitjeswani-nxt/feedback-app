import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pods = await DatabaseService.getPodsByTeam(params.id)
    return NextResponse.json({ pods })
  } catch (error) {
    console.error("Error fetching pods:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
