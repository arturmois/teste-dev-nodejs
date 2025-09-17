import { useEffect, useState } from "react";

import type { SocketUserData } from "@/types/socketTypes";

import { useSocket } from "./use-socket";

export function useOnlineUsers() {
  const { usersOnline, onUserStatusChange } = useSocket();
  const [localUsers, setLocalUsers] = useState<SocketUserData[]>(usersOnline);

  useEffect(() => {
    setLocalUsers(usersOnline);
  }, [usersOnline]);

  useEffect(() => {
    const unsubscribe = onUserStatusChange((users) => {
      setTimeout(() => {
        setLocalUsers(users);
      }, 0);
    });

    return unsubscribe;
  }, [onUserStatusChange]);

  return {
    usersOnline: localUsers,
    isUserOnline: (userId: string) =>
      localUsers.some((user) => user.id === userId),
    getOnlineCount: () => localUsers.length,
  };
}
