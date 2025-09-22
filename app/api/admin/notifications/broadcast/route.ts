import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Notification } from "@/lib/models/Notification";
import { logAuditAction } from "@/lib/db-utils";

export async function POST(request: NextRequest) {
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

    const {
      title,
      message,
      targetRoles,
      priority = "medium",
      entityType = "user",
      entityId,
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Get target users based on roles
    let targetUsers;
    if (targetRoles && targetRoles.length > 0 && !targetRoles.includes("all")) {
      targetUsers = await User.find({ role: { $in: targetRoles } });
    } else {
      targetUsers = await User.find({});
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      userId: user._id,
      title,
      message,
      type: "system",
      priority,
      read: false,
    }));

    await Notification.insertMany(notifications);

    // Log audit action
    await logAuditAction(
      currentUser.clerkId,
      currentUser.role,
      "broadcast_notification_sent",
      entityType,
      entityId
    );

    return NextResponse.json({
      message: "Broadcast notification sent successfully",
      recipientCount: targetUsers.length,
    });
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
