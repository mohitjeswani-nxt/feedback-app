import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await DatabaseService.getUserByClerkId(userId)
    if (!user || !["team_member", "team_lead", "admin", "co_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ticketId, issueDescription, course, unit, topic } = await request.json()

    if (!ticketId || !issueDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate AI suggestions (in a real implementation, you'd call an AI service)
    const suggestions = {
      proposedSolution: generateSolution(issueDescription, course, unit, topic),
      preventiveMeasures: generatePreventiveMeasures(issueDescription, course, unit),
    }

    // Update feedback with AI suggestions
    await DatabaseService.updateFeedback(ticketId, {
      aiSuggestions: suggestions,
    })

    // Log the AI suggestion request
    await DatabaseService.createAuditLog({
      userId,
      userRole: user.role,
      action: "ai_suggestions_requested",
      entityType: "feedback",
      entityId: ticketId,
      metadata: {
        issueDescription: issueDescription.substring(0, 100) + "...",
      },
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error generating AI suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateSolution(issue: string, course: string, unit: string, topic: string): string {
  // Simulate AI-generated solutions based on common patterns
  const solutions = [
    `Review the ${topic} content in ${unit} and update any outdated information. Cross-reference with the latest curriculum standards.`,
    `Check for technical issues in the ${course} platform. Verify all links and multimedia content are working correctly.`,
    `Update the ${unit} materials to include clearer explanations and additional examples for better understanding.`,
    `Implement user feedback by adding interactive elements to the ${topic} section to improve engagement.`,
    `Review and optimize the content structure in ${unit} to ensure logical flow and better learning outcomes.`,
  ]

  return solutions[Math.floor(Math.random() * solutions.length)]
}

function generatePreventiveMeasures(issue: string, course: string, unit: string): string {
  const measures = [
    `Establish regular content review cycles for ${course} to catch issues early.`,
    `Implement automated testing for all interactive elements in ${unit}.`,
    `Create a feedback collection system for students to report issues quickly.`,
    `Set up monitoring alerts for technical issues in the learning platform.`,
    `Develop a content quality checklist for all new materials added to ${course}.`,
  ]

  return measures[Math.floor(Math.random() * measures.length)]
}
