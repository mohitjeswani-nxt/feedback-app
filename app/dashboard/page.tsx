import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DatabaseService } from "@/lib/db-utils"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await DatabaseService.getUserByClerkId(userId)

  if (!user || !user.role) {
    redirect("/profile-setup")
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case "student":
      redirect("/dashboard/student")
    case "auditor":
      redirect("/dashboard/auditor")
    case "team_lead":
      redirect("/dashboard/team-lead")
    case "team_member":
      redirect("/dashboard/team-member")
    case "admin":
    case "co_admin":
      redirect("/dashboard/admin")
    default:
      redirect("/profile-setup")
  }
}
