"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { AuditTrail } from "@/components/admin/audit-trail";
import { BroadcastNotifications } from "@/components/admin/broadcast-notifications";
import { DashboardHeader } from "@/components/dashboard-header";
import { Users, FileText, BarChart3, Shield, Bell, Database, UserCog } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader title="Admin Control Panel" description="Comprehensive system management and oversight" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Feedback</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">-5% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCog className="h-5 w-5 text-blue-500" />
                    <span>Manage Users & Roles</span>
                  </div>
                  <span className="text-sm text-muted-foreground">156 users</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span>Form Templates</span>
                  </div>
                  <span className="text-sm text-muted-foreground">8 templates</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <span>Send Notifications</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Broadcast</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>New feedback submitted by John Doe</span>
                    <span className="text-muted-foreground ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Feedback #FB-2024-001 resolved</span>
                    <span className="text-muted-foreground ml-auto">15m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>User role updated: Jane Smith → Team Lead</span>
                    <span className="text-muted-foreground ml-auto">1h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>New form template created: Academy v2</span>
                    <span className="text-muted-foreground ml-auto">3h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage user roles, teams, and permissions</p>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
              <p className="text-sm text-muted-foreground">Create and manage dynamic feedback forms</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Form builder interface will be loaded here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <p className="text-sm text-muted-foreground">Complete system activity log with detailed tracking</p>
            </CardHeader>
            <CardContent>
              <AuditTrail />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BroadcastNotifications />

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In-App Notifications</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SLA Alerts</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Maintenance</span>
                    <span className="text-yellow-600">Scheduled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">Comprehensive reporting and insights</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics dashboard will be loaded here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
