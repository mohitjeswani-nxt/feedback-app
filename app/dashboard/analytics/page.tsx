"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { Charts } from "@/components/analytics/charts";
import { ExportControls } from "@/components/analytics/export-controls";
import { DashboardHeader } from "@/components/dashboard-header";
import { BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  metrics: {
    totalFeedback: number;
    recentFeedback: number;
    resolvedFeedback: number;
    overdueFeedback: number;
    slaComplianceRate: number;
    avgResolutionTime: number;
  };
  distributions: {
    status: Array<{ _id: string; count: number }>;
    program: Array<{ _id: string; count: number }>;
    priority: Array<{ _id: string; count: number }>;
  };
  trends: {
    daily: Array<{ _id: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/overview?period=${period}`);
      const analyticsData = await response.json();

      if (response.ok) {
        setData(analyticsData);
      } else {
        toast.error(analyticsData.error || "Failed to fetch analytics");
      }
    } catch (error) {
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader
        title="Analytics & Reporting"
        description="Comprehensive insights and performance metrics"
        className="mb-6"
      />

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
          <SelectItem value="365">Last year</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-6">
        <MetricsCards metrics={data.metrics} />

        <Charts distributions={data.distributions} trends={data.trends} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Resolution Efficiency</h4>
                      <p className="text-sm text-muted-foreground">
                        Average time to resolve feedback
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {data.metrics.avgResolutionTime} days
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.metrics.avgResolutionTime <= 3
                          ? "Excellent"
                          : "Needs improvement"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">SLA Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Percentage of feedback resolved within SLA
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {data.metrics.slaComplianceRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.metrics.slaComplianceRate >= 90
                          ? "On target"
                          : "Below target"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Workload Distribution</h4>
                      <p className="text-sm text-muted-foreground">
                        Active feedback requiring attention
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {data.metrics.totalFeedback -
                          data.metrics.resolvedFeedback}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.metrics.overdueFeedback > 0
                          ? `${data.metrics.overdueFeedback} overdue`
                          : "All on track"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ExportControls />
        </div>
      </div>
    </div>
  );
}
