import mongoose from "mongoose";

export interface User {
  _id?: string;
  clerkId: string;
  email: string;
  name: string;
  role:
    | "student"
    | "auditor"
    | "team_lead"
    | "team_member"
    | "admin"
    | "co_admin";
  program?: "NIAT" | "Intensive" | "Academy";
  admissionYear?: number;
  university?: string;
  studentId?: string;
  contactNumber?: string;
  teamId?: string;
  podId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "student",
        "auditor",
        "team_lead",
        "team_member",
        "admin",
        "co_admin",
      ],
      required: true,
    },
    program: {
      type: String,
      enum: ["NIAT", "Intensive", "Academy"],
    },
    admissionYear: {
      type: Number,
    },
    university: {
      type: String,
    },
    studentId: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    podId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pod",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

export interface Team {
  _id?: string;
  name: string;
  leadId: string;
  memberIds: string[];
  podIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    podIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pod",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

export interface Pod {
  _id?: string;
  name: string;
  teamId: string;
  leadId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Pod = mongoose.models.Pod || mongoose.model("Pod", PodSchema);
