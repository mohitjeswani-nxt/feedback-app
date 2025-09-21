import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { Feedback } from "@/lib/models/Feedback"

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
    const period = searchParams.get("period") || "30" // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Get basic metrics
    const totalFeedback = await Feedback.countDocuments()
    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: startDate },
    })

    const resolvedFeedback = await Feedback.countDocuments({
      status: "completed",
    })

    const overdueFeedback = await Feedback.countDocuments({
      slaDeadline: { $lt: new Date() },
      status: { $nin: ["completed", "closed"] },
    })

    // SLA compliance rate
    const slaCompliantFeedback = await Feedback.countDocuments({
      status: "completed",
      resolvedAt: { $lte: "$slaDeadline" },
    })

    const slaComplianceRate = resolvedFeedback > 0 ? ((slaCompliantFeedback / resolvedFeedback) * 100).toFixed(1) : "0"

    // Average resolution time
    const resolvedWithTimes = await Feedback.aggregate([
      {
        $match: {
          status: "completed",
          resolvedAt: { $exists: true },
          assignedAt: { $exists: true },
        },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$assignedAt"] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: "$resolutionTime" },
        },
      },
    ])

    const avgResolutionTime = resolvedWithTimes.length > 0 ? resolvedWithTimes[0].avgResolutionTime.toFixed(1) : "0"

    // Feedback by status
    const statusDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Feedback by program
    const programDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$program",
          count: { $sum: 1 },
        },
      },
    ])

    // Feedback by priority
    const priorityDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    // Daily feedback trend
    const dailyTrend = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    return NextResponse.json({
      metrics: {
        totalFeedback,
        recentFeedback,
        resolvedFeedback,
        overdueFeedback,
        slaComplianceRate: Number.parseFloat(slaComplianceRate),
        avgResolutionTime: Number.parseFloat(avgResolutionTime),
      },
      distributions: {
        status: statusDistribution,
        program: programDistribution,
        priority: priorityDistribution,
      },
      trends: {
        daily: dailyTrend,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
