"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import useSocket from "@/hooks/use-socket";
import type { SocketUserData } from "@/types/socketTypes";

import { useOnlineUsers } from "../../../hooks/use-online-users";
import { ChatArea } from "./_components/chat-area";
import { ChatHeader } from "./_components/chat-header";
import { UserSidebar } from "./_components/user-sidebar";

const mockUser: SocketUserData = {
  id: "1",
  name: "João Silva",
  username: "joao.silva",
  isOnline: true,
  lastSeen: new Date(),
  avatar: "https://github.com/shadcn.png",
};

const mockUsers: SocketUserData[] = [
  {
    id: "2",
    name: "Maria Santos",
    username: "maria.santos",
    isOnline: true,
    lastSeen: new Date(),
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: "3",
    name: "Pedro Costa",
    username: "pedro.costa",
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    username: "ana.oliveira",
    isOnline: true,
    lastSeen: new Date(),
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: "5",
    name: "Carlos Lima",
    username: "carlos.lima",
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    avatar: "https://github.com/shadcn.png",
  },
];

export default function ChatPage() {
  console.log("ChatPage render");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const { socket, isConnected, transport } = useSocket();
  const { usersOnline } = useOnlineUsers();

  const allUsers: SocketUserData[] =
    usersOnline.length > 0 ? usersOnline : mockUsers;
  const selectedUser = allUsers.find(
    (user: SocketUserData) => user.id === selectedUserId,
  );
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    console.log("Socket conectado:", isConnected);
    console.log("Transport:", transport);
    console.log("Usuários online:", usersOnline.length);
    socket?.emit("hello", "world");
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <div className="fixed top-0 right-0 left-0 z-50">
        <ChatHeader
          onLogout={handleLogout}
          selectedUser={selectedUser}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>

      <div className="hidden w-80 overflow-hidden pt-14 lg:block">
        <UserSidebar
          users={allUsers}
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
            users={allUsers}
            selectedUserId={selectedUserId}
            onUserSelect={handleUserSelect}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden pt-14 lg:pl-0">
        <div className="flex-1 overflow-hidden">
          <ChatArea
            selectedUser={selectedUser}
            currentUser={mockUser as SocketUserData}
          />
        </div>
      </div>
    </div>
  );
}
