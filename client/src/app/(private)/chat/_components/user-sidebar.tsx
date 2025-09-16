"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  lastSeen?: Date;
}

interface UserSidebarProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
}

export function UserSidebar({
  users,
  selectedUserId,
  onUserSelect,
}: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "";
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="border-sidebar-border flex h-full flex-col overflow-hidden border-r">
      <div className="flex-shrink-0 p-4.5">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-sidebar-accent border-sidebar-border pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="text-sidebar-foreground/70 px-3 py-2 text-sm font-medium">
            Usuários Online (
            {filteredUsers.filter((u) => u.status === "online").length})
          </h3>

          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserSelect(user.id)}
              className={`hover:bg-sidebar-accent/50 flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${selectedUserId === user.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground"} `}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={`border-sidebar absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 ${getStatusColor(user.status)} `}
                />
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs opacity-70">
                  {user.status === "online"
                    ? "Online"
                    : user.status === "away"
                      ? "Ausente"
                      : `Visto ${formatLastSeen(user.lastSeen)}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
