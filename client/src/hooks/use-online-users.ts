import { useEffect, useState } from "react";

import { useSocket } from "./use-socket";

// Interface para o usuário (compatível com a interface User do ChatArea)
interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  lastSeen?: Date;
}

export function useOnlineUsers() {
  const { usersOnline, onUserStatusChange } = useSocket();
  const [localUsers, setLocalUsers] = useState<User[]>(usersOnline);

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
