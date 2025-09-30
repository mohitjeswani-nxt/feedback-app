"use client";

import type React from "react";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    program: "",
    admissionYear: "",
    university: "",
    studentId: "",
    contactNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields based on role
      if (!formData.role) {
        toast({
          title: "Validation Error",
          description: "Please select a role.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // For students, validate additional required fields
      if (
        formData.role === "student" &&
        (!formData.program || !formData.studentId || !formData.contactNumber)
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields for student role.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        role: formData.role,
        ...(formData.role === "student" && {
          program: formData.program,
          studentId: formData.studentId,
          contactNumber: formData.contactNumber,
          ...(formData.program === "NIAT" && {
            admissionYear: formData.admissionYear
              ? parseInt(formData.admissionYear)
              : undefined,
            university: formData.university,
          }),
        }),
      };

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: "Profile updated successfully",
          description: "You can now access your dashboard.",
        });
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide additional information to set up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={formData.program}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, program: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIAT">NIAT</SelectItem>
                      <SelectItem value="Intensive">Intensive</SelectItem>
                      <SelectItem value="Academy">Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.role === "student" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student/Employee ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          studentId: e.target.value,
                        }))
                      }
                      placeholder="Enter your ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter your contact number"
                    />
                  </div>
                </div>

                {formData.program === "NIAT" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admissionYear">Admission Year</Label>
                      <Input
                        id="admissionYear"
                        type="number"
                        value={formData.admissionYear}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            admissionYear: e.target.value,
                          }))
                        }
                        placeholder="2024"
                        min="2020"
                        max="2030"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={formData.university}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            university: e.target.value,
                          }))
                        }
                        placeholder="Enter your university"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.role}
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
