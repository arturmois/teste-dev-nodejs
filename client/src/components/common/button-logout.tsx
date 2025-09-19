"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const ButtonLogout = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <Button onClick={handleLogout}>
      <span className="hidden md:block">Sair</span>
      <LogOut className="h-4 w-4" />
    </Button>
  );
};

export default ButtonLogout;
