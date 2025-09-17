"use client";

import { LogOut, Menu, Phone, Video } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  lastSeen?: Date;
}

interface ChatHeaderProps {
  selectedUser?: User;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export function ChatHeader({
  selectedUser,
  onLogout,
  onMenuClick,
}: ChatHeaderProps) {
  return (
    <header className="bg-card border-border border-b px-4 py-3">
      <div className="flex items-center justify-between">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="pl-30">
          <Image
            src="/logo.png"
            alt="logo"
            height={52}
            width={52}
            className="rounded-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedUser && (
            <>
              {/* Botões de telefone e vídeo visíveis apenas em telas maiores */}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          {/* Botão de logout */}
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
