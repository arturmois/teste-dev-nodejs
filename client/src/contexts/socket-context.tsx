"use client";

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

import { useAuth } from "./auth-context";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  usersOnline: SocketUserData[];
  messages: MessageData[];
  sendMessage: (content: string, receiverId: string) => void;
  unreadMessages: Record<string, number>;
  setUnreadMessages: (unreadMessages: Record<string, number>) => void;
  selectedUserId: RefObject<string | null>;
  disconnectSocket: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
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

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setUsersOnline([]);
      setMessages([]);
      setUnreadMessages({});
    }
  }, []);

  const showNotification = useCallback(
    (senderId: string) => {
      if (unreadMessages[senderId] > 0) return;
      toast("Nova mensagem recebida", {
        description: "Você tem uma nova mensagem",
        style: {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          opacity: 0.85,
        },
        position: "top-center",
      });
    },
    [unreadMessages],
  );

  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const connectSocket = () => {
      const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        timeout: 20000,
      });

      newSocket.on("connect", () => {
        setIsConnected(true);

        newSocket.emit("userOnline", {
          id: user.id,
          name: user.name || "Usuário",
          username: user.username,
          avatar: user.avatar || "",
        });
      });

      newSocket.on("connect_error", (error) => {
        console.error("Erro na conexão WebSocket:", error);
        setIsConnected(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("WebSocket desconectado:", reason);
        setIsConnected(false);
      });

      newSocket.on("newMessage", (message: MessageData) => {
        setMessages((prev) => [...prev, message]);
        if (
          message.senderId !== selectedUserId.current &&
          message.receiverId === user.id
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

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
      };
    };

    const timeoutId = setTimeout(connectSocket, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    usersOnline,
    messages,
    sendMessage,
    unreadMessages,
    setUnreadMessages,
    selectedUserId,
    disconnectSocket,
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
