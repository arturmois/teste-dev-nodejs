"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

const ButtonLogout = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });
    router.push("/auth/signin");
  };
  return (
    <Button onClick={handleLogout}>
      <span className="hidden md:block">Sair</span>
      <LogOut className="h-4 w-4" />
    </Button>
  );
};

export default ButtonLogout;
