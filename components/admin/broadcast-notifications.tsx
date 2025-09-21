"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Users } from "lucide-react"
import { toast } from "sonner"

export function BroadcastNotifications() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "medium",
    targetRoles: [] as string[],
  })
  const [sending, setSending] = useState(false)

  const roles = [
    { id: "all", label: "All Users" },
    { id: "student", label: "Students" },
    { id: "auditor", label: "Auditors" },
    { id: "team-lead", label: "Team Leads" },
    { id: "team-member", label: "Team Members" },
    { id: "co-admin", label: "Co-Admins" },
  ]

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (roleId === "all") {
      setForm({
        ...form,
        targetRoles: checked ? ["all"] : [],
      })
    } else {
      const newRoles = checked
        ? [...form.targetRoles.filter((r) => r !== "all"), roleId]
        : form.targetRoles.filter((r) => r !== roleId)

      setForm({
        ...form,
        targetRoles: newRoles,
      })
    }
  }

  const handleSendBroadcast = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required")
      return
    }

    if (form.targetRoles.length === 0) {
      toast.error("Please select at least one target role")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Broadcast sent to ${data.recipientCount} users`)
        setForm({
          title: "",
          message: "",
          priority: "medium",
          targetRoles: [],
        })
      } else {
        toast.error(data.error || "Failed to send broadcast")
      }
    } catch (error) {
      toast.error("Failed to send broadcast")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Broadcast Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Notification title..."
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Notification message..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Roles</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.id}
                  checked={
                    form.targetRoles.includes(role.id) || (role.id !== "all" && form.targetRoles.includes("all"))
                  }
                  onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                  disabled={role.id !== "all" && form.targetRoles.includes("all")}
                />
                <Label htmlFor={role.id} className="text-sm">
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSendBroadcast} disabled={sending} className="w-full">
          {sending ? "Sending..." : "Send Broadcast"}
          <Users className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
