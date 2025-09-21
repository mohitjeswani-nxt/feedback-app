"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FeedbackAssignmentModal } from "@/components/auditor/feedback-assignment-modal";
import { DashboardHeader } from "@/components/dashboard-header";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Clock, AlertTriangle, FileText, ArrowUpDown } from "lucide-react";

export default function AuditorDashboard() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<any[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortFeedback();
  }, [feedback, searchTerm, statusFilter, priorityFilter, programFilter, sortBy]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/feedback/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterAndSortFeedback = () => {
    let filtered = [...feedback];

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.issueDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((item) => item.priority === priorityFilter);
    }

    if (programFilter !== "all") {
      filtered = filtered.filter((item) => item.program === programFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case "oldest":
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case "sla":
          if (!a.slaDeadline && !b.slaDeadline) return 0;
          if (!a.slaDeadline) return 1;
          if (!b.slaDeadline) return -1;
          return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
        default:
          return 0;
      }
    });

    setFilteredFeedback(filtered);
  };

  const handleSelectFeedback = (feedback: any, checked: boolean) => {
    if (checked) {
      setSelectedFeedback((prev) => [...prev, feedback]);
    } else {
      setSelectedFeedback((prev) => prev.filter((f) => f.ticketId !== feedback.ticketId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFeedback(filteredFeedback.filter((f) => f.status === "submitted"));
    } else {
      setSelectedFeedback([]);
    }
  };

  const openAssignmentModal = (feedbackItems?: any[]) => {
    if (feedbackItems) {
      setSelectedFeedback(feedbackItems);
    }
    setShowAssignmentModal(true);
  };

  const handleAssignmentSuccess = () => {
    setSelectedFeedback([]);
    fetchFeedback();
    fetchStats();
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

  const unassignedCount = feedback.filter((f) => f.status === "submitted").length;
  const assignedCount = feedback.filter((f) => f.status === "assigned").length;
  const inProgressCount = feedback.filter((f) => f.status === "in_progress").length;
  const overdueCount = feedback.filter((f) => f.slaDeadline && isOverdue(f.slaDeadline)).length;

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
      <DashboardHeader title="Auditor Dashboard" description="Review and assign feedback to teams" />

      {selectedFeedback.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => openAssignmentModal()}>Assign Selected ({selectedFeedback.length})</Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold">{unassignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{assignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
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
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket ID, student, course, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
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

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="NIAT">NIAT</SelectItem>
                  <SelectItem value="Intensive">Intensive</SelectItem>
                  <SelectItem value="Academy">Academy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="sla">SLA Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback Queue</CardTitle>
              <CardDescription>{filteredFeedback.length} feedback items</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedFeedback.length === filteredFeedback.filter((f) => f.status === "submitted").length &&
                  filteredFeedback.filter((f) => f.status === "submitted").length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All Unassigned</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No feedback matches your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <Card key={item.ticketId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {item.status === "submitted" && (
                        <Checkbox
                          checked={selectedFeedback.some((f) => f.ticketId === item.ticketId)}
                          onCheckedChange={(checked) => handleSelectFeedback(item, checked as boolean)}
                        />
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.ticketId}</code>
                              <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                              {item.priority && (
                                <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                              )}
                              {item.slaDeadline && isOverdue(item.slaDeadline) && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium">{item.studentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.program} • {item.course} • {item.unit}
                            </p>
                          </div>

                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(item.submittedAt).toLocaleDateString()}</p>
                            {item.slaDeadline && (
                              <p className={isOverdue(item.slaDeadline) ? "text-red-600" : ""}>
                                SLA: {new Date(item.slaDeadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{item.issueDescription}</p>

                        {item.kpiCategory && <Badge variant="outline">{item.kpiCategory}</Badge>}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.screenshots?.length > 0 && <span>{item.screenshots.length} screenshots</span>}
                            {item.video && <span>1 video</span>}
                          </div>

                          {item.status === "submitted" && (
                            <Button size="sm" onClick={() => openAssignmentModal([item])}>
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeedbackAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        feedback={selectedFeedback}
        onAssignSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
