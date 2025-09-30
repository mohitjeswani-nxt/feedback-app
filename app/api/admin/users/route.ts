import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { logAuditAction } from "@/lib/db-utils";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || !["admin", "co-admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const query: any = {};
    if (role && role !== "all") query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-clerkId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { targetUserId, role, teamId, podId } = await request.json();

    // Only admin can promote/demote co-admins
    if (role === "co-admin" && currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can manage co-admin roles" },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      console.log("Authenticated userId:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    if (teamId) targetUser.teamId = teamId;
    if (podId) targetUser.podId = podId;

    await targetUser.save();

    // Log audit action
    await logAuditAction(
      currentUser._id,
      currentUser.role,
      "user",
      targetUser._id,
      "user_role_updated"
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
