"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/team/kanban-board";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { useToast } from "@/hooks/use-toast";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function TeamLeadDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamFeedback();
    fetchTeamMembers();
  }, []);

  const fetchTeamFeedback = async () => {
    try {
      const response = await fetch("/api/feedback/team");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams/members");
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAssignMember = (feedbackItem: any) => {
    // Open assignment modal (implementation would go here)
    console.log("Assign member to:", feedbackItem.ticketId);
  };

  const handleApproveResolution = (feedbackItem: any) => {
    // Open approval modal (implementation would go here)
    console.log("Review resolution for:", feedbackItem.ticketId);
  };

  const getStats = () => {
    const assigned = feedback.filter((f) => f.status === "assigned").length;
    const inProgress = feedback.filter((f) => f.status === "in_progress").length;
    const pendingApproval = feedback.filter(
      (f) => ["resolved", "no_issue_found"].includes(f.status) && f.leadApprovalStatus === "pending"
    ).length;
    const overdue = feedback.filter((f) => f.slaDeadline && new Date(f.slaDeadline) < new Date()).length;

    return { assigned, inProgress, pendingApproval, overdue };
  };

  const stats = getStats();

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
      <DashboardHeader title="Team Lead Dashboard" description="Manage your team's workload and approve resolutions" />

      <div className="flex justify-end">
        <Badge variant="outline" className="text-sm">
          {feedback.length} Active Items
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{stats.assigned}</p>
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
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
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

      <Tabs defaultValue="kanban" className="space-y-6">
        <TabsList>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          <TabsTrigger value="team">Team Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <Card>
            <CardHeader>
              <CardTitle>Team Workload</CardTitle>
              <CardDescription>Manage assignments and approve resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <KanbanBoard
                feedback={feedback}
                onAssignMember={handleAssignMember}
                onApproveResolution={handleApproveResolution}
                userRole="team_lead"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const memberFeedback = feedback.filter((f) => f.assignedMemberId === member.clerkId);
              const activeTasks = memberFeedback.filter((f) => ["pending", "in_progress"].includes(f.status)).length;
              const completedTasks = memberFeedback.filter((f) => f.status === "completed").length;

              return (
                <Card key={member.clerkId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Tasks</span>
                        <Badge variant="outline">{activeTasks}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <Badge variant="outline">{completedTasks}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Assigned</span>
                        <Badge variant="outline">{memberFeedback.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
