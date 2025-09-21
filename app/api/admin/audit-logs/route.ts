import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { AuditLog } from "@/lib/models/AuditLog"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser || !["admin", "co-admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const query: any = {}
    if (action && action !== "all") query.action = action
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { "metadata.ticketId": { $regex: search, $options: "i" } },
      ]
    }
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = new Date(startDate)
      if (endDate) query.timestamp.$lte = new Date(endDate)
    }

    const logs = await AuditLog.find(query)
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await AuditLog.countDocuments(query)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
