"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react"

interface MetricsCardsProps {
  metrics: {
    totalFeedback: number
    recentFeedback: number
    resolvedFeedback: number
    overdueFeedback: number
    slaComplianceRate: number
    avgResolutionTime: number
  }
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Feedback",
      value: metrics.totalFeedback.toLocaleString(),
      icon: FileText,
      trend: metrics.recentFeedback > 0 ? "up" : "neutral",
      trendValue: `+${metrics.recentFeedback} this month`,
    },
    {
      title: "Resolved",
      value: metrics.resolvedFeedback.toLocaleString(),
      icon: CheckCircle,
      trend: "up",
      trendValue: `${((metrics.resolvedFeedback / metrics.totalFeedback) * 100).toFixed(1)}% resolution rate`,
    },
    {
      title: "SLA Compliance",
      value: `${metrics.slaComplianceRate}%`,
      icon: Clock,
      trend: metrics.slaComplianceRate >= 90 ? "up" : "down",
      trendValue: metrics.slaComplianceRate >= 90 ? "Excellent" : "Needs improvement",
    },
    {
      title: "Overdue",
      value: metrics.overdueFeedback.toLocaleString(),
      icon: AlertTriangle,
      trend: metrics.overdueFeedback > 0 ? "down" : "up",
      trendValue: metrics.overdueFeedback > 0 ? "Requires attention" : "All on track",
    },
    {
      title: "Avg Resolution Time",
      value: `${metrics.avgResolutionTime} days`,
      icon: TrendingUp,
      trend: metrics.avgResolutionTime <= 3 ? "up" : "down",
      trendValue: metrics.avgResolutionTime <= 3 ? "Fast resolution" : "Could be faster",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
              {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
              <span>{card.trendValue}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
