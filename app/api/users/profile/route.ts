import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/db-utils";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await DatabaseService.getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { clerkId, _id, createdAt, updatedAt, ...allowedUpdates } = updates;

    // Check if user exists, if not create them
    let user = await DatabaseService.getUserByClerkId(userId);

    if (!user) {
      console.log(`User ${userId} not found, creating new user`);
      // Create user with basic info - we'll use minimal data since we don't have access to Clerk user here
      try {
        const newUser = await DatabaseService.createUser({
          clerkId: userId,
          email: "unknown@example.com", // Will be updated by webhook
          name: "Unknown User", // Will be updated by webhook
          role: "student", // Default role, will be updated below
        });
        user = newUser as any; // Type assertion to handle the return type
      } catch (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json({ error: "Unable to create user" }, { status: 400 });
      }
    }

    const success = await DatabaseService.updateUser(userId, allowedUpdates);

    if (!success) {
      console.error(`Failed to update user ${userId} with data:`, allowedUpdates);
      return NextResponse.json({ error: "Failed to update user" }, { status: 400 });
    }

    // Log the update
    await DatabaseService.createAuditLog({
      userId,
      userRole: updates.role || (user ? user.role : "unknown"),
      action: "profile_updated",
      entityType: "user",
      entityId: userId,
      changes: Object.entries(allowedUpdates).map(([field, newValue]) => ({
        field,
        oldValue: user ? user[field as keyof typeof user] : null,
        newValue,
      })),
    });

    console.log(`Successfully updated user ${userId} with role: ${updates.role}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
