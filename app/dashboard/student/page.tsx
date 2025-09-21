"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicFeedbackForm } from "@/components/feedback/dynamic-feedback-form";
import { FeedbackSuccess } from "@/components/feedback/feedback-success";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard-header";
import { Plus, Search, Filter, FileText, Clock, CheckCircle } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("submit");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUserProfile();
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchTerm, statusFilter]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.issueDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredFeedback(filtered);
  };

  const handleSubmitSuccess = (ticketId: string) => {
    setSuccessTicketId(ticketId);
    setShowSuccess(true);
    fetchFeedback(); // Refresh feedback list
  };

  const handleViewFeedback = () => {
    setActiveTab("my-feedback");
    setShowSuccess(false);
  };

  const handleSubmitAnother = () => {
    setShowSuccess(false);
    // Stay on submit tab
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-4 w-4" />;
      case "assigned":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!userProfile) {
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
      <DashboardHeader
        title="Student Dashboard"
        description={`Welcome back, ${user?.firstName || "Student"}! Submit feedback and track your requests.`}
      />

      {userProfile?.program && (
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Program</p>
            <Badge variant="outline" className="text-sm">
              {userProfile.program}
            </Badge>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger value="my-feedback" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Feedback ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          {showSuccess ? (
            <FeedbackSuccess
              ticketId={successTicketId}
              onViewFeedback={handleViewFeedback}
              onSubmitAnother={handleSubmitAnother}
            />
          ) : (
            <>
              {userProfile.program ? (
                <DynamicFeedbackForm program={userProfile.program} onSubmitSuccess={handleSubmitSuccess} />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Please complete your profile setup to submit feedback.</p>
                    <Button onClick={() => (window.location.href = "/profile-setup")}>Complete Profile</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="my-feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Feedback History</CardTitle>
              <CardDescription>Track the status of your submitted feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ticket ID, course, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {feedback.length === 0 ? "No feedback submitted yet" : "No feedback matches your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <Card key={item.ticketId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.ticketId}</code>
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1 capitalize">{item.status.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            <h3 className="font-medium">
                              {item.course} - {item.unit}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.topic}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(item.submittedAt).toLocaleDateString()}</p>
                            {item.priority && (
                              <Badge variant="outline" className="mt-1">
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.issueDescription}</p>

                        {item.resolutionText && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                            <p className="text-sm text-green-700">{item.resolutionText}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
