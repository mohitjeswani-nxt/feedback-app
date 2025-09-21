export interface User {
  _id?: string
  clerkId: string
  email: string
  name: string
  role: "student" | "auditor" | "team_lead" | "team_member" | "admin" | "co_admin"
  program?: "NIAT" | "Intensive" | "Academy"
  admissionYear?: number
  university?: string
  studentId?: string
  contactNumber?: string
  teamId?: string
  podId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  _id?: string
  name: string
  leadId: string
  memberIds: string[]
  podIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Pod {
  _id?: string
  name: string
  teamId: string
  leadId: string
  memberIds: string[]
  createdAt: Date
  updatedAt: Date
}
