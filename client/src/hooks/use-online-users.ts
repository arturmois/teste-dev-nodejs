import { useSocket } from "./use-socket";

export function useOnlineUsers() {
  const { usersOnline } = useSocket();

  return {
    usersOnline,
    isUserOnline: (userId: string) =>
      usersOnline.some((user) => user.id === userId),
    getOnlineCount: () => usersOnline.length,
  };
}
