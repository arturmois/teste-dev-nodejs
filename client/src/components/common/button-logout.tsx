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
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default ButtonLogout;
