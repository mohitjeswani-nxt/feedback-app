export interface Feedback {
  _id?: string
  ticketId: string
  studentId: string
  program: "NIAT" | "Intensive" | "Academy"

  // Common fields
  studentName: string
  email: string
  contactNumber: string
  course: string
  unit: string
  topic: string
  unitDiscussionLink?: string
  unitType: string
  issueDescription: string
  questionLink?: string
  suggestedSolution?: string

  // NIAT specific fields
  admissionYear?: number
  university?: string
  studentEmployeeId?: string
  reportedBy?: string

  // Academy specific fields
  trackType?: "Smart" | "Genius"

  // File attachments
  screenshots: string[] // URLs to uploaded files
  video?: string // URL to uploaded video

  // Workflow fields
  status: "submitted" | "assigned" | "pending" | "in_progress" | "resolved" | "no_issue_found" | "completed"
  priority: "low" | "medium" | "high" | "critical"
  kpiCategory?: string
  slaHours?: number
  assignedTeamId?: string
  assignedPodId?: string
  assignedMemberId?: string
  auditorId?: string

  // Resolution fields
  resolutionText?: string
  daysTaken?: number
  actualResolutionDate?: Date
  preventiveMeasures?: string
  memberComments?: string
  leadApprovalStatus?: "pending" | "approved" | "rejected"
  leadComments?: string

  // AI suggestions
  aiSuggestions?: {
    proposedSolution: string
    preventiveMeasures: string
  }

  // Timestamps
  submittedAt: Date
  assignedAt?: Date
  slaDeadline?: Date
  resolvedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface FormField {
  _id?: string
  name: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea" | "file" | "date"
  required: boolean
  options?: string[] // For select fields
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  order: number
}

export interface FormTemplate {
  _id?: string
  programType: string
  name: string
  description: string
  fields: FormField[]
  isActive: boolean
  version: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
