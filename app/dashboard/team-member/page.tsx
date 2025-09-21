"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, AlertTriangle, Lightbulb, FileText, Calendar } from "lucide-react";

export default function TeamMemberDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    resolutionText: "",
    preventiveMeasures: "",
    memberComments: "",
    daysTaken: 0,
  });

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const response = await fetch("/api/feedback/my-tasks");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSuggestions = async (feedbackItem: any) => {
    try {
      const response = await fetch("/api/feedback/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: feedbackItem.ticketId,
          issueDescription: feedbackItem.issueDescription,
          course: feedbackItem.course,
          unit: feedbackItem.unit,
          topic: feedbackItem.topic,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = (feedbackItem: any) => {
    setSelectedFeedback(feedbackItem);
    setUpdateForm({
      status: feedbackItem.status === "pending" ? "in_progress" : "resolved",
      resolutionText: feedbackItem.resolutionText || "",
      preventiveMeasures: feedbackItem.preventiveMeasures || "",
      memberComments: feedbackItem.memberComments || "",
      daysTaken: feedbackItem.daysTaken || 0,
    });
    setAiSuggestions(feedbackItem.aiSuggestions || null);
    setShowUpdateModal(true);
  };

  const submitUpdate = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch("/api/feedback/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedFeedback.ticketId,
          ...updateForm,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
        setShowUpdateModal(false);
        fetchMyTasks();
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const pending = feedback.filter((f) => f.status === "pending").length;
    const inProgress = feedback.filter((f) => f.status === "in_progress").length;
    const completed = feedback.filter((f) => f.status === "completed").length;
    const overdue = feedback.filter((f) => f.slaDeadline && new Date(f.slaDeadline) < new Date()).length;

    return { pending, inProgress, completed, overdue };
  };

  const stats = getStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (slaDeadline: string) => {
    return slaDeadline && new Date(slaDeadline) < new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader title="My Tasks" description="Manage your assigned feedback items" />

      <div className="flex justify-end">
        <Badge variant="outline" className="text-sm">
          {feedback.length} Total Tasks
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>Click on a task to update its status or view details</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card key={item.ticketId} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.ticketId}</code>
                          <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                          <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                          {item.slaDeadline && isOverdue(item.slaDeadline) && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium">
                          {item.course} - {item.unit}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.topic}</p>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <p>Assigned: {new Date(item.assignedAt).toLocaleDateString()}</p>
                        {item.targetResolutionDate && (
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {new Date(item.targetResolutionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.issueDescription}</p>

                    {item.resolutionText && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-green-800 mb-1">Your Resolution:</p>
                        <p className="text-sm text-green-700">{item.resolutionText}</p>
                      </div>
                    )}

                    {item.leadComments && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-blue-800 mb-1">Lead Feedback:</p>
                        <p className="text-sm text-blue-700">{item.leadComments}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.aiSuggestions && (
                          <Badge variant="outline" className="text-xs">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            AI Suggestions Available
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!item.aiSuggestions && ["pending", "in_progress"].includes(item.status) && (
                          <Button size="sm" variant="outline" onClick={() => fetchAiSuggestions(item)}>
                            <Lightbulb className="h-4 w-4 mr-1" />
                            Get AI Help
                          </Button>
                        )}

                        {["pending", "in_progress"].includes(item.status) && (
                          <Button size="sm" onClick={() => handleUpdateStatus(item)}>
                            Update Status
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>
              Update the status and provide resolution details for {selectedFeedback?.ticketId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {aiSuggestions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Suggestions
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Proposed Solution:</p>
                    <p className="text-sm text-blue-600">{aiSuggestions.proposedSolution}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Preventive Measures:</p>
                    <p className="text-sm text-blue-600">{aiSuggestions.preventiveMeasures}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value) => setUpdateForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="no_issue_found">No Issue Found</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["resolved", "no_issue_found"].includes(updateForm.status) && (
              <>
                <div className="space-y-2">
                  <Label>Resolution Details *</Label>
                  <Textarea
                    value={updateForm.resolutionText}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, resolutionText: e.target.value }))}
                    placeholder="Describe how you resolved this issue..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preventive Measures</Label>
                  <Textarea
                    value={updateForm.preventiveMeasures}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, preventiveMeasures: e.target.value }))}
                    placeholder="What measures can prevent this issue in the future?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Days Taken</Label>
                  <Input
                    type="number"
                    value={updateForm.daysTaken}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, daysTaken: Number.parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Additional Comments</Label>
              <Textarea
                value={updateForm.memberComments}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, memberComments: e.target.value }))}
                placeholder="Any additional comments or notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitUpdate}>Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
