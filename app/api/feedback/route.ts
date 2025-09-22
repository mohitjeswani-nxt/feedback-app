import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/db-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await DatabaseService.getUserByClerkId(userId);
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can submit feedback" },
        { status: 403 }
      );
    }

    const feedbackData = await request.json();

    const feedback = await DatabaseService.createFeedback({
      ...feedbackData,
      studentId: userId,
      status: "submitted",
      priority: "medium", // Default priority
      submittedAt: new Date(),
    });

    // Create notification for auditors
    await DatabaseService.createNotification({
      userId: "system", // Will be sent to all auditors
      type: "feedback_submitted",
      title: "New Feedback Submitted",
      message: `New feedback submitted by ${user.name} - Ticket ID: ${feedback.ticketId}`,
      priority: "high",
      read: false,
      updatedAt: new Date(),
    });

    // Log the submission
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "feedback_submitted",
      entityType: "feedback",
      entityId: feedback.ticketId,
      metadata: {
        program: feedback.program,
        course: feedback.course,
        unit: feedback.unit,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: feedback.ticketId,
      feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await DatabaseService.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Students can only see their own feedback
    if (user.role === "student") {
      const feedback = await DatabaseService.getUserFeedback(userId);
      return NextResponse.json({ feedback });
    }

    // Other roles can see all feedback (will be filtered by role-specific logic)
    const feedback = await DatabaseService.getAllFeedback();
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
