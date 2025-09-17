import { useEffect, useState } from "react";

import type { SocketUserData } from "@/types/socketTypes";

import { useSocket } from "./use-socket";

export function useOnlineUsers() {
  const { usersOnline, onUserStatusChange } = useSocket();
  const [localUsers, setLocalUsers] = useState<SocketUserData[]>(usersOnline);

  useEffect(() => {
    setLocalUsers(usersOnline);

    const unsubscribe = onUserStatusChange((users) => {
      setLocalUsers(users);
    });

    return unsubscribe;
  }, [usersOnline, onUserStatusChange]);

  return {
    usersOnline: localUsers,
    isUserOnline: (userId: string) =>
      localUsers.some((user) => user.id === userId),
    getOnlineCount: () => localUsers.length,
  };
}
