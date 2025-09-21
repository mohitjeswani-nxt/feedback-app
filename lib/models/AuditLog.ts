export interface AuditLog {
  _id?: string
  userId: string
  userRole: string
  action: string
  entityType: "feedback" | "user" | "team" | "pod" | "form_template"
  entityId: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface Notification {
  _id?: string
  userId: string
  type:
    | "feedback_submitted"
    | "feedback_assigned"
    | "status_changed"
    | "resolution_approved"
    | "resolution_rejected"
    | "sla_warning"
    | "broadcast"
  title: string
  message: string
  feedbackId?: string
  isRead: boolean
  createdAt: Date
}
