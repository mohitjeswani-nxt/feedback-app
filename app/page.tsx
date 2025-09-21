import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Redirect to appropriate dashboard based on user role
  redirect("/dashboard")
}
