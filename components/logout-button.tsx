"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
  children = "Logout",
}: LogoutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleLogout} variant={variant} size={size} className={`${className}`}>
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
