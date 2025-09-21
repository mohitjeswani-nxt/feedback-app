import clientPromise from "./mongodb"
import type { User, Team, Feedback, AuditLog, Notification, FormTemplate } from "./models"

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db("feedback_management")
  }

  // User operations
  static async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("users").insertOne(user)
    return { ...user, _id: result.insertedId.toString() }
  }

  static async getUserByClerkId(clerkId: string) {
    const db = await this.getDb()
    return await db.collection("users").findOne({ clerkId })
  }

  static async updateUser(clerkId: string, updates: Partial<User>) {
    const db = await this.getDb()
    const result = await db.collection("users").updateOne({ clerkId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  // Team operations
  static async createTeam(teamData: Omit<Team, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const team = {
      ...teamData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("teams").insertOne(team)
    return { ...team, _id: result.insertedId.toString() }
  }

  static async getTeams() {
    const db = await this.getDb()
    return await db.collection("teams").find({}).toArray()
  }

  static async getTeamById(teamId: string) {
    const db = await this.getDb()
    return await db.collection("teams").findOne({ _id: teamId })
  }

  static async getPodsByTeam(teamId: string) {
    const db = await this.getDb()
    return await db.collection("pods").find({ teamId }).toArray()
  }

  // Feedback operations
  static async createFeedback(feedbackData: Omit<Feedback, "_id" | "ticketId" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const ticketId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const feedback = {
      ...feedbackData,
      ticketId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("feedback").insertOne(feedback)
    return { ...feedback, _id: result.insertedId.toString() }
  }

  static async getFeedbackByTicketId(ticketId: string) {
    const db = await this.getDb()
    return await db.collection("feedback").findOne({ ticketId })
  }

  static async updateFeedback(ticketId: string, updates: Partial<Feedback>) {
    const db = await this.getDb()
    const result = await db
      .collection("feedback")
      .updateOne({ ticketId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  static async getUserFeedback(userId: string) {
    const db = await this.getDb()
    return await db.collection("feedback").find({ studentId: userId }).sort({ createdAt: -1 }).toArray()
  }

  static async getAllFeedback() {
    const db = await this.getDb()
    return await db.collection("feedback").find({}).sort({ createdAt: -1 }).toArray()
  }

  static async getFeedbackByStatus(status: string) {
    const db = await this.getDb()
    return await db.collection("feedback").find({ status }).sort({ createdAt: -1 }).toArray()
  }

  static async getUnassignedFeedback() {
    const db = await this.getDb()
    return await db.collection("feedback").find({ status: "submitted" }).sort({ createdAt: -1 }).toArray()
  }

  static async getFeedbackStats() {
    const db = await this.getDb()
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]
    return await db.collection("feedback").aggregate(pipeline).toArray()
  }

  static async searchFeedback(query: any) {
    const db = await this.getDb()
    return await db.collection("feedback").find(query).sort({ createdAt: -1 }).toArray()
  }

  // Audit log operations
  static async createAuditLog(logData: Omit<AuditLog, "_id" | "timestamp">) {
    const db = await this.getDb()
    const auditLog = {
      ...logData,
      timestamp: new Date(),
    }
    await db.collection("audit_logs").insertOne(auditLog)
  }

  // Notification operations
  static async createNotification(notificationData: Omit<Notification, "_id" | "createdAt">) {
    const db = await this.getDb()
    const notification = {
      ...notificationData,
      createdAt: new Date(),
    }
    const result = await db.collection("notifications").insertOne(notification)
    return { ...notification, _id: result.insertedId.toString() }
  }

  static async getUserNotifications(userId: string, limit = 50) {
    const db = await this.getDb()
    return await db.collection("notifications").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  // Form template operations
  static async createFormTemplate(templateData: Omit<FormTemplate, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const template = {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("form_templates").insertOne(template)
    return { ...template, _id: result.insertedId.toString() }
  }

  static async getFormTemplates() {
    const db = await this.getDb()
    return await db.collection("form_templates").find({}).sort({ createdAt: -1 }).toArray()
  }

  static async getFormTemplateByProgram(programType: string) {
    const db = await this.getDb()
    return await db.collection("form_templates").findOne({
      programType,
      isActive: true,
    })
  }

  static async updateFormTemplate(templateId: string, updates: Partial<FormTemplate>) {
    const db = await this.getDb()
    const result = await db
      .collection("form_templates")
      .updateOne({ _id: templateId }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  static async deleteFormTemplate(templateId: string) {
    const db = await this.getDb()
    const result = await db.collection("form_templates").deleteOne({ _id: templateId })
    return result.deletedCount > 0
  }
}

export const logAuditAction = async (userId: string, action: string, description: string, metadata?: any) => {
  try {
    await DatabaseService.createAuditLog({
      userId,
      action,
      description,
      metadata,
    })
  } catch (error) {
    console.error("Failed to log audit action:", error)
  }
}
