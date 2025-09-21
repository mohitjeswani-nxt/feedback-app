"use client";

import { useUser } from "@clerk/nextjs";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  showUserInfo?: boolean;
  className?: string;
}

export function DashboardHeader({ title, description, showUserInfo = true, className = "" }: DashboardHeaderProps) {
  const { user } = useUser();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "co_admin":
        return "Co-Administrator";
      case "team_lead":
        return "Team Lead";
      case "team_member":
        return "Team Member";
      case "auditor":
        return "Auditor";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "admin":
      case "co_admin":
        return "destructive";
      case "team_lead":
        return "default";
      case "auditor":
        return "secondary";
      case "team_member":
        return "outline";
      case "student":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {showUserInfo && user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
              <AvatarFallback>
                {user.firstName?.[0] || "U"}
                {user.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium">
                {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <LogoutButton variant="outline" size="sm" />
        </div>
      )}
    </div>
  );
}
