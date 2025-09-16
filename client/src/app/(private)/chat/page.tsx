"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

import { ChatArea } from "./_components/chat-area";
import { ChatHeader } from "./_components/chat-header";
import { UserSidebar } from "./_components/user-sidebar";

// Mock data para demonstração
const mockUser = {
  id: "1",
  name: "João Silva",
  avatar: "https://github.com/shadcn.png",
  status: "online" as const,
};

const mockUsers = [
  {
    id: "2",
    name: "Maria Santos",
    avatar: "https://github.com/shadcn.png",
    status: "online" as const,
    lastSeen: new Date(),
  },
  {
    id: "3",
    name: "Pedro Costa",
    avatar: "https://github.com/shadcn.png",
    status: "away" as const,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "4",
    name: "Ana Oliveira",
    avatar: "https://github.com/shadcn.png",
    status: "online" as const,
    lastSeen: new Date(),
  },
  {
    id: "5",
    name: "Carlos Lima",
    avatar: "https://github.com/shadcn.png",
    status: "offline" as const,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  const selectedUser = mockUsers.find((user) => user.id === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Implementar lógica de logout aqui
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <div className="fixed top-0 right-0 left-0 z-50">
        <ChatHeader
          user={mockUser}
          onLogout={handleLogout}
          selectedUser={selectedUser}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>

      <div className="hidden w-80 overflow-hidden pt-14 lg:block">
        <UserSidebar
          users={mockUsers}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
        />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="bg-sidebar w-[85%] p-0">
          <SheetHeader>
            <SheetTitle>Usuários</SheetTitle>
          </SheetHeader>
          <UserSidebar
            users={mockUsers}
            selectedUserId={selectedUserId}
            onUserSelect={handleUserSelect}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden pt-14 lg:pl-0">
        <div className="flex-1 overflow-hidden">
          <ChatArea selectedUser={selectedUser} currentUser={mockUser} />
        </div>
      </div>
    </div>
  );
}
