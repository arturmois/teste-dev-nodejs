"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useSocketContext } from "@/contexts/socket-context";

const ButtonLogout = () => {
  console.log("ButtonLogout");
  const { logout } = useAuth();
  const { disconnectSocket } = useSocketContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await logout(disconnectSocket);
      router.push("/auth/signin");
    } catch (error) {
      console.error("Erro no logout:", error);
      disconnectSocket();
      router.push("/auth/signin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} aria-label="Sair" disabled={isLoading}>
      <span className="hidden md:block">
        {isLoading ? "Saindo..." : "Sair"}
      </span>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ButtonLogout;
