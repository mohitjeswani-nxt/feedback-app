"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { toast } from "sonner"

interface AuditLog {
  _id: string
  userId: {
    name: string
    email: string
    role: string
  }
  action: string
  description: string
  timestamp: string
  metadata?: any
}

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [search, actionFilter, startDate, endDate])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (actionFilter !== "all") params.append("action", actionFilter)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
      } else {
        toast.error(data.error || "Failed to fetch audit logs")
      }
    } catch (error) {
      toast.error("Failed to fetch audit logs")
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "feedback_submitted":
        return "bg-blue-500"
      case "feedback_assigned":
        return "bg-yellow-500"
      case "status_updated":
        return "bg-green-500"
      case "user_role_updated":
        return "bg-purple-500"
      case "broadcast_notification":
        return "bg-orange-500"
      case "form_template_created":
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading audit logs...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="feedback_submitted">Feedback Submitted</SelectItem>
            <SelectItem value="feedback_assigned">Feedback Assigned</SelectItem>
            <SelectItem value="status_updated">Status Updated</SelectItem>
            <SelectItem value="user_role_updated">User Role Updated</SelectItem>
            <SelectItem value="broadcast_notification">Broadcast Sent</SelectItem>
            <SelectItem value="form_template_created">Form Created</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.userId.name}</div>
                    <div className="text-sm text-muted-foreground">{log.userId.role}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getActionBadgeColor(log.action)}>
                    {log.action.replace("_", " ").toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate">{log.description}</div>
                </TableCell>
                <TableCell>
                  {log.metadata && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground">View</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </details>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
