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
import type { SocketUserData } from "@/types/socketTypes";

import { useOnlineUsers } from "../../../hooks/use-online-users";
import { ChatArea } from "./_components/chat-area";
import { ChatHeader } from "./_components/chat-header";
import { UserSidebar } from "./_components/user-sidebar";

export default function ChatPage() {
  console.log("ChatPage render");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const { usersOnline } = useOnlineUsers();

  const allUsers: SocketUserData[] = usersOnline.length > 0 ? usersOnline : [];
  const selectedUser = allUsers.find(
    (user: SocketUserData) => user.id === selectedUserId,
  );
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <div className="fixed top-0 right-0 left-0 z-50">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
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
            <SheetDescription>
              Selecione um usuário para começar a conversar
            </SheetDescription>
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
            currentUser={selectedUser as SocketUserData}
          />
        </div>
      </div>
    </div>
  );
}
