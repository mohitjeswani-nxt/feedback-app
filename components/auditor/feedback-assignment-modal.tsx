"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface FeedbackAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  feedback: any[]
  onAssignSuccess: () => void
}

export function FeedbackAssignmentModal({ isOpen, onClose, feedback, onAssignSuccess }: FeedbackAssignmentModalProps) {
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [pods, setPods] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    teamId: "",
    podId: "",
    priority: "medium",
    kpiCategory: "",
    slaHours: 24,
  })

  useEffect(() => {
    if (isOpen) {
      fetchTeams()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.teamId) {
      fetchPods(formData.teamId)
    } else {
      setPods([])
      setFormData((prev) => ({ ...prev, podId: "" }))
    }
  }, [formData.teamId])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const fetchPods = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/pods`)
      if (response.ok) {
        const data = await response.json()
        setPods(data.pods || [])
      }
    } catch (error) {
      console.error("Error fetching pods:", error)
    }
  }

  const handleAssign = async () => {
    if (!formData.teamId || !formData.priority || !formData.slaHours) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const endpoint = feedback.length === 1 ? "/api/feedback/assign" : "/api/feedback/bulk-assign"
      const payload =
        feedback.length === 1
          ? { ticketId: feedback[0].ticketId, ...formData }
          : { ticketIds: feedback.map((f) => f.ticketId), ...formData }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description:
            feedback.length === 1
              ? "Feedback assigned successfully"
              : `${data.assigned || feedback.length} feedback items assigned successfully`,
        })
        onAssignSuccess()
        onClose()
      } else {
        throw new Error("Failed to assign feedback")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const kpiCategories = [
    "Content Error",
    "Technical Issue",
    "Feature Request",
    "User Experience",
    "Performance",
    "Accessibility",
    "Other",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Feedback {feedback.length > 1 && `(${feedback.length} items)`}</DialogTitle>
          <DialogDescription>Assign feedback to a team and set priority and SLA requirements.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {feedback.length > 1 && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">Selected Feedback Items:</h4>
              <div className="flex flex-wrap gap-2">
                {feedback.slice(0, 5).map((item) => (
                  <Badge key={item.ticketId} variant="outline">
                    {item.ticketId}
                  </Badge>
                ))}
                {feedback.length > 5 && <Badge variant="outline">+{feedback.length - 5} more</Badge>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team *</Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pod (Optional)</Label>
              <Select
                value={formData.podId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, podId: value }))}
                disabled={!formData.teamId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pod" />
                </SelectTrigger>
                <SelectContent>
                  {pods.map((pod) => (
                    <SelectItem key={pod._id} value={pod._id}>
                      {pod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>SLA Hours *</Label>
              <Input
                type="number"
                value={formData.slaHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, slaHours: Number.parseInt(e.target.value) || 24 }))}
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>KPI Category</Label>
            <Select
              value={formData.kpiCategory}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, kpiCategory: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {kpiCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading}>
              {loading ? "Assigning..." : `Assign ${feedback.length > 1 ? `${feedback.length} Items` : "Feedback"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
