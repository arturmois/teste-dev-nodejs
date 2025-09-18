"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

import { type MessageData, SocketUserData } from "@/types/socketTypes";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  usersOnline: SocketUserData[];
  messages: MessageData[];
  sendMessage: (content: string, receiverId: string) => void;
  unreadMessages: Record<string, number>;
  setUnreadMessages: (unreadMessages: Record<string, number>) => void;
  selectedUserId: RefObject<string | null>;
}

export const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usersOnline, setUsersOnline] = useState<SocketUserData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {},
  );
  const selectedUserId = useRef<string | null>(null);

  const sendMessage = (content: string, receiverId: string) => {
    if (socket && isConnected) {
      socket.emit("sendMessage", {
        content: content.trim(),
        receiverId,
      });
    }
  };

  const showNotification = useCallback(
    (senderId: string) => {
      if (unreadMessages[senderId] > 0) return;
      toast("Notificação de mensagem recebida", {
        description: "Você tem uma nova mensagem",
        action: {
          label: "Ver",
          onClick: () => console.log("Ver"),
        },
        style: {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          opacity: 0.85,
        },
      });
    },
    [unreadMessages],
  );

  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
      withCredentials: true,
      auth: {
        token: session.token,
      },
    });

    newSocket.on("connect", () => {
      console.log("connected to server");
      setIsConnected(true);

      newSocket.emit("userOnline", {
        id: session.user.id,
        name: session.user.name || "Usuário",
        username: session.user.username || session.user.name || "Usuário",
        avatar: session.user.avatar || "",
      });
    });

    newSocket.on("disconnect", () => {
      console.log("disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("newMessage", (message: MessageData) => {
      setMessages((prev) => [...prev, message]);
      if (
        message.senderId !== selectedUserId.current &&
        message.receiverId === session?.user.id
      ) {
        showNotificationRef.current(message.senderId);
        setUnreadMessages((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      }
    });

    newSocket.on("messageSent", (message: MessageData) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("messagesHistory", (recentMessages: MessageData[]) => {
      setMessages(recentMessages);
    });

    newSocket.on("onlineUsers", (users: SocketUserData[]) => {
      setUsersOnline(users);
    });

    newSocket.on("onlineUser", (user: SocketUserData) => {
      setUsersOnline((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        if (exists)
          return prev.map((u) =>
            u.id === user.id ? { ...user, isOnline: true } : u,
          );
        return [user, ...prev];
      });
    });

    newSocket.on("offlineUser", (userId: string) => {
      setUsersOnline((prev) =>
        prev.map((user) =>
          user.id !== userId ? user : { ...user, isOnline: false },
        ),
      );
    });

    newSocket.on("error", (error: string) => {
      console.error("server error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    usersOnline,
    messages,
    sendMessage,
    unreadMessages,
    setUnreadMessages,
    selectedUserId,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext deve ser usado dentro de SocketProvider");
  }
  return context;
}
