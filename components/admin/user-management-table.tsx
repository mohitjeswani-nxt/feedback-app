"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit } from "lucide-react"
import { toast } from "sonner"

interface User {
  _id: string
  name: string
  email: string
  role: string
  teamId?: string
  podId?: string
  createdAt: string
}

interface Team {
  _id: string
  name: string
  pods: Array<{ _id: string; name: string }>
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    role: "",
    teamId: "",
    podId: "",
  })

  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (roleFilter !== "all") params.append("role", roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        toast.error(data.error || "Failed to fetch users")
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      const data = await response.json()
      if (response.ok) {
        setTeams(data.teams)
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      role: user.role,
      teamId: user.teamId || "",
      podId: user.podId || "",
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: editingUser._id,
          ...editForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("User updated successfully")
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "co-admin":
        return "bg-orange-500"
      case "auditor":
        return "bg-blue-500"
      case "team-lead":
        return "bg-purple-500"
      case "team-member":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="auditor">Auditor</SelectItem>
            <SelectItem value="team-lead">Team Lead</SelectItem>
            <SelectItem value="team-member">Team Member</SelectItem>
            <SelectItem value="co-admin">Co-Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team/Pod</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role.replace("-", " ").toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  {user.teamId && (
                    <span className="text-sm text-muted-foreground">
                      Team: {teams.find((t) => t._id === user.teamId)?.name || "Unknown"}
                      {user.podId &&
                        ` / Pod: ${teams.find((t) => t._id === user.teamId)?.pods.find((p) => p._id === user.podId)?.name || "Unknown"}`}
                    </span>
                  )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={editForm.role}
                            onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="auditor">Auditor</SelectItem>
                              <SelectItem value="team-lead">Team Lead</SelectItem>
                              <SelectItem value="team-member">Team Member</SelectItem>
                              <SelectItem value="co-admin">Co-Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="team">Team</Label>
                          <Select
                            value={editForm.teamId}
                            onValueChange={(value) => setEditForm({ ...editForm, teamId: value, podId: "" })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Team</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {editForm.teamId && (
                          <div>
                            <Label htmlFor="pod">Pod</Label>
                            <Select
                              value={editForm.podId}
                              onValueChange={(value) => setEditForm({ ...editForm, podId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select pod" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Pod</SelectItem>
                                {teams
                                  .find((t) => t._id === editForm.teamId)
                                  ?.pods.map((pod) => (
                                    <SelectItem key={pod._id} value={pod._id}>
                                      {pod.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Button onClick={handleUpdateUser} className="w-full">
                          Update User
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
