"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import ButtonLogout from "@/components/common/button-logout";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onMenuClick?: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
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
        <div className="md:pl-30">
          <Link href="/chat">
            <Image
              src="/logo.png"
              alt="logo"
              height={52}
              width={52}
              className="cursor-pointer rounded-full"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ButtonLogout />
        </div>
      </div>
    </header>
  );
}
