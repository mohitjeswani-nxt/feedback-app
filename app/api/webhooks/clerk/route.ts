import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { DatabaseService } from "@/lib/db-utils";

export async function POST(req: Request) {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);

  const WEBHOOK_CLERK_SECRET = process.env.WEBHOOK_CLERK_SECRET;
  console.log("WEBHOOK_CLERK_SECRET exists:", !!WEBHOOK_CLERK_SECRET);

  if (!WEBHOOK_CLERK_SECRET) {
    console.error("WEBHOOK_CLERK_SECRET is missing");
    throw new Error("Please add WEBHOOK_CLERK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  console.log("All headers:", Object.fromEntries(headerPayload.entries()));

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Svix headers:", { svix_id, svix_timestamp, svix_signature });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log("Webhook payload:", JSON.stringify(payload, null, 2));

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_CLERK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    console.log("Attempting to verify webhook...");
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verification successful");
  } catch (err) {
    console.error("Error verifying webhook:", err);
    console.error("Verification error details:", {
      svix_id,
      svix_timestamp,
      svix_signature: svix_signature?.substring(0, 20) + "...",
      payload_keys: Object.keys(payload),
      body_length: body.length,
    });

    // For development/testing, allow unverified webhooks if they have the right structure
    if (process.env.NODE_ENV === "development" && payload.type && payload.data) {
      console.log("Development mode: Allowing unverified webhook for testing");
      evt = payload as WebhookEvent;
    } else {
      return new Response("Error occured", {
        status: 400,
      });
    }
  }

  // Handle the webhook
  const eventType = evt.type;

  console.log("Received Clerk webhook event:", eventType);
  console.log("Event data:", evt.data);

  if (eventType === "user.created") {
    console.log("Processing user.created event");
    const { id, email_addresses, first_name, last_name } = evt.data;
    console.log("User data:", { id, email_addresses, first_name, last_name });

    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByClerkId(id);
      if (existingUser) {
        console.log(`User ${id} already exists in database, skipping creation`);
        return new Response("", { status: 200 });
      }

      const userData = {
        clerkId: id,
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        role: "student", // Default role
      };
      console.log("Creating user with data:", userData);

      const result = await DatabaseService.createUser(userData);
      console.log(`User ${id} created in database successfully:`, result);
    } catch (error) {
      console.error("Error creating user in database:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
  }

  if (eventType === "user.updated") {
    console.log("Processing user.updated event");
    const { id, email_addresses, first_name, last_name } = evt.data;
    console.log("User data:", { id, email_addresses, first_name, last_name });

    try {
      // Check if user exists before updating
      const existingUser = await DatabaseService.getUserByClerkId(id);
      if (!existingUser) {
        console.log(`User ${id} not found in database, creating new user instead`);

        // Create user if it doesn't exist (in case webhook was missed)
        const userData = {
          clerkId: id,
          email: email_addresses[0]?.email_address || "",
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          role: "student", // Default role
        };

        const result = await DatabaseService.createUser(userData);
        console.log(`User ${id} created in database successfully:`, result);
      } else {
        // Update existing user
        await DatabaseService.updateUser(id, {
          email: email_addresses[0]?.email_address || "",
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          updatedAt: new Date(),
        });

        console.log(`User ${id} updated in database`);
      }
    } catch (error) {
      console.error("Error updating user in database:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
  }

  return new Response("", { status: 200 });
}
