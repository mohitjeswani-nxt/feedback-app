import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { DatabaseService } from "@/lib/db-utils";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_SECRET_KEY;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_SECRET_KEY from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      await DatabaseService.createUser({
        clerkId: id,
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        role: "student", // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`User ${id} created in database`);
    } catch (error) {
      console.error("Error creating user in database:", error);
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      await DatabaseService.updateUser(id, {
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        updatedAt: new Date(),
      });

      console.log(`User ${id} updated in database`);
    } catch (error) {
      console.error("Error updating user in database:", error);
    }
  }

  return new Response("", { status: 200 });
}
