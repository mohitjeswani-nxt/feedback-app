import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Feedback } from "@/lib/models/Feedback";
import { logAuditAction } from "@/lib/db-utils";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || !["admin", "co-admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const program = searchParams.get("program");

    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status && status !== "all") query.status = status;
    if (program && program !== "all") query.program = program;

    const feedbacks = await Feedback.find(query)
      .populate("submittedBy", "name email")
      .populate("assignedTo.teamId", "name")
      .populate("assignedTo.podId", "name")
      .populate("assignedTo.memberId", "name")
      .sort({ createdAt: -1 });

    if (format === "csv") {
      const csvHeaders = [
        "Ticket ID",
        "Program",
        "Status",
        "Priority",
        "Category",
        "Submitted By",
        "Submitted Date",
        "Assigned Team",
        "Assigned Pod",
        "Assigned Member",
        "SLA Deadline",
        "Resolved Date",
        "Resolution Time (Days)",
        "Description",
      ].join(",");

      const csvRows = feedbacks.map((feedback) => {
        const resolutionTime =
          feedback.resolvedAt && feedback.assignedAt
            ? Math.ceil(
                (feedback.resolvedAt.getTime() -
                  feedback.assignedAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : "";

        return [
          feedback.ticketId,
          feedback.program,
          feedback.status,
          feedback.priority || "",
          feedback.category || "",
          feedback.submittedBy?.name || "",
          feedback.createdAt.toISOString().split("T")[0],
          feedback.assignedTo?.teamId?.name || "",
          feedback.assignedTo?.podId?.name || "",
          feedback.assignedTo?.memberId?.name || "",
          feedback.slaDeadline
            ? feedback.slaDeadline.toISOString().split("T")[0]
            : "",
          feedback.resolvedAt
            ? feedback.resolvedAt.toISOString().split("T")[0]
            : "",
          resolutionTime,
          `"${feedback.description.replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = [csvHeaders, ...csvRows].join("\n");

      // Log audit action
      await logAuditAction(
        currentUser._id,
        currentUser.role,
        "feedback",
        "feedback",
        "feedback_data_exported"
      );

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="feedback-export-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
