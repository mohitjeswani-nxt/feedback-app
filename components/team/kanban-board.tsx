"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, User, Calendar, MessageSquare } from "lucide-react"

interface KanbanBoardProps {
  feedback: any[]
  onAssignMember?: (feedback: any) => void
  onUpdateStatus?: (feedback: any) => void
  onApproveResolution?: (feedback: any) => void
  userRole: string
}

export function KanbanBoard({
  feedback,
  onAssignMember,
  onUpdateStatus,
  onApproveResolution,
  userRole,
}: KanbanBoardProps) {
  const columns = [
    { id: "assigned", title: "Assigned", status: "assigned" },
    { id: "pending", title: "Pending", status: "pending" },
    { id: "in_progress", title: "In Progress", status: "in_progress" },
    { id: "resolved", title: "Resolved", status: "resolved" },
    { id: "no_issue", title: "No Issue Found", status: "no_issue_found" },
  ]

  const getFeedbackByStatus = (status: string) => {
    return feedback.filter((item) => item.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isOverdue = (slaDeadline: string) => {
    return slaDeadline && new Date(slaDeadline) < new Date()
  }

  const getTimeRemaining = (slaDeadline: string) => {
    if (!slaDeadline) return null
    const now = new Date()
    const deadline = new Date(slaDeadline)
    const diff = deadline.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 0) return "Overdue"
    if (hours < 24) return `${hours}h remaining`
    const days = Math.floor(hours / 24)
    return `${days}d remaining`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {columns.map((column) => {
        const columnFeedback = getFeedbackByStatus(column.status)

        return (
          <div key={column.id} className="flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{column.title}</h3>
              <Badge variant="outline" className="mt-1">
                {columnFeedback.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 min-h-96">
              {columnFeedback.map((item) => (
                <Card key={item.ticketId} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{item.ticketId}</code>
                      <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.course} - {item.unit}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.topic}</p>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{item.issueDescription}</p>

                    {item.slaDeadline && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue(item.slaDeadline) ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        {isOverdue(item.slaDeadline) ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {getTimeRemaining(item.slaDeadline)}
                      </div>
                    )}

                    {item.assignedMemberId && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Assigned to member</span>
                      </div>
                    )}

                    {item.targetResolutionDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Target: {new Date(item.targetResolutionDate).toLocaleDateString()}
                      </div>
                    )}

                    {item.resolutionText && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs text-green-800 line-clamp-2">{item.resolutionText}</p>
                      </div>
                    )}

                    {item.leadComments && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <MessageSquare className="h-3 w-3" />
                        Lead feedback available
                      </div>
                    )}

                    <div className="flex gap-1 pt-2">
                      {userRole === "team_lead" && column.status === "assigned" && onAssignMember && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 bg-transparent"
                          onClick={() => onAssignMember(item)}
                        >
                          Assign Member
                        </Button>
                      )}

                      {userRole === "team_member" &&
                        ["pending", "in_progress"].includes(column.status) &&
                        onUpdateStatus && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 bg-transparent"
                            onClick={() => onUpdateStatus(item)}
                          >
                            Update Status
                          </Button>
                        )}

                      {userRole === "team_lead" &&
                        ["resolved", "no_issue_found"].includes(column.status) &&
                        item.leadApprovalStatus === "pending" &&
                        onApproveResolution && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 bg-transparent"
                            onClick={() => onApproveResolution(item)}
                          >
                            Review
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnFeedback.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No items</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
