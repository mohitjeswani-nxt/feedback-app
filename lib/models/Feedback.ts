import mongoose from "mongoose";

export interface Feedback {
  _id?: string;
  ticketId: string;
  studentId: string;
  program: "NIAT" | "Intensive" | "Academy";

  // Common fields
  studentName: string;
  email: string;
  contactNumber: string;
  course: string;
  unit: string;
  topic: string;
  unitDiscussionLink?: string;
  unitType: string;
  issueDescription: string;
  questionLink?: string;
  suggestedSolution?: string;

  // NIAT specific fields
  admissionYear?: number;
  university?: string;
  studentEmployeeId?: string;
  reportedBy?: string;

  // Academy specific fields
  trackType?: "Smart" | "Genius";

  // File attachments
  screenshots: string[]; // URLs to uploaded files
  video?: string; // URL to uploaded video

  // Workflow fields
  status:
    | "submitted"
    | "assigned"
    | "pending"
    | "in_progress"
    | "resolved"
    | "no_issue_found"
    | "completed";
  priority: "low" | "medium" | "high" | "critical";
  kpiCategory?: string;
  slaHours?: number;
  assignedTeamId?: string;
  assignedPodId?: string;
  assignedMemberId?: string;
  auditorId?: string;

  // Resolution fields
  resolutionText?: string;
  daysTaken?: number;
  actualResolutionDate?: Date;
  targetResolutionDate?: Date;
  preventiveMeasures?: string;
  memberComments?: string;
  leadApprovalStatus?: "pending" | "approved" | "rejected";
  leadComments?: string;

  // AI suggestions
  aiSuggestions?: {
    proposedSolution: string;
    preventiveMeasures: string;
  };

  // Timestamps
  submittedAt: Date;
  assignedAt?: Date;
  slaDeadline?: Date;
  resolvedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      enum: ["NIAT", "Intensive", "Academy"],
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    unitDiscussionLink: String,
    unitType: {
      type: String,
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    questionLink: String,
    suggestedSolution: String,
    admissionYear: Number,
    university: String,
    studentEmployeeId: String,
    reportedBy: String,
    trackType: {
      type: String,
      enum: ["Smart", "Genius"],
    },
    screenshots: [
      {
        type: String,
      },
    ],
    video: String,
    status: {
      type: String,
      enum: [
        "submitted",
        "assigned",
        "pending",
        "in_progress",
        "resolved",
        "no_issue_found",
        "completed",
      ],
      default: "submitted",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    kpiCategory: String,
    slaHours: Number,
    assignedTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    assignedPodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pod",
    },
    assignedMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    auditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionText: String,
    daysTaken: Number,
    actualResolutionDate: Date,
    targetResolutionDate: Date,
    preventiveMeasures: String,
    memberComments: String,
    leadApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    leadComments: String,
    aiSuggestions: {
      proposedSolution: String,
      preventiveMeasures: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    assignedAt: Date,
    slaDeadline: Date,
    resolvedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export interface FormField {
  _id?: string;
  name: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "file" | "date";
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

export interface FormTemplate {
  _id?: string;
  programType: string;
  name: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "email", "number", "select", "textarea", "file", "date"],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [
    {
      type: String,
    },
  ],
  placeholder: String,
  validation: {
    min: Number,
    max: Number,
    pattern: String,
  },
  order: {
    type: Number,
    required: true,
  },
});

const FormTemplateSchema = new mongoose.Schema(
  {
    programType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fields: [FormFieldSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FormTemplate =
  mongoose.models.FormTemplate ||
  mongoose.model("FormTemplate", FormTemplateSchema);
