"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

import { socketEvents } from "@/types/socketEvents";
import { type MessageData, SocketUserData } from "@/types/socketTypes";

interface SocketState {
  isConnected: boolean;
  transport: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  usersOnline: SocketUserData[];
  messages: MessageData[];

  sendMessage: (content: string, receiverId: string) => void;
  clearMessages: () => void;

  onMessage: (callback: (message: MessageData) => void) => () => void;
  onUserStatusChange: (
    callback: (users: SocketUserData[]) => void,
  ) => () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

const convertSocketUserToUser = (
  socketUser: SocketUserData,
): SocketUserData => ({
  id: socketUser.id,
  name: socketUser.name,
  username: socketUser.username,
  avatar: socketUser.avatar,
  isOnline: socketUser.isOnline,
  lastSeen: socketUser.lastSeen,
});

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session } = useSession();

  const socketRef = useRef<Socket | null>(null);
  const [usersOnline, setUsersOnline] = useState<SocketUserData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    transport: "N/A",
  });

  const messageCallbacksRef = useRef<Set<(message: MessageData) => void>>(
    new Set(),
  );
  const userStatusCallbacksRef = useRef<Set<(users: SocketUserData[]) => void>>(
    new Set(),
  );

  const sendMessage = useCallback(
    (content: string, receiverId: string) => {
      if (socketRef.current && socketState.isConnected) {
        const messageData = {
          content,
          receiverId,
          timestamp: new Date().toISOString(),
        };
        socketRef.current.emit("send_message", messageData);
      }
    },
    [socketState.isConnected],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const onMessage = useCallback((callback: (message: MessageData) => void) => {
    messageCallbacksRef.current.add(callback);
    return () => {
      messageCallbacksRef.current.delete(callback);
    };
  }, []);

  const onUserStatusChange = useCallback(
    (callback: (users: SocketUserData[]) => void) => {
      userStatusCallbacksRef.current.add(callback);
      return () => {
        userStatusCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  useEffect(() => {
    if (session?.token) {
      console.log("Iniciando conexão socket...");
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
        withCredentials: true,
        auth: {
          token: session.token,
        },
      });
      const socket = socketRef.current;
      const onConnect = () => {
        console.log("Socket conectado");
        setSocketState({
          isConnected: true,
          transport: socket.io.engine.transport.name,
        });
      };
      const onDisconnect = () => {
        console.log("Socket desconectado");
        setSocketState({
          isConnected: false,
          transport: "N/A",
        });
      };
      const onConnectError = (error: Error) => {
        console.error("Erro na conexão socket:", error.message);
      };
      const onUsersOnline = (users: SocketUserData[]) => {
        console.log("Usuários online atualizados:", users.length);
        const convertedUsers = users.map(convertSocketUserToUser);
        setUsersOnline(convertedUsers);
        setTimeout(() => {
          userStatusCallbacksRef.current.forEach((callback) =>
            callback(convertedUsers),
          );
        }, 0);
      };
      const onUserOnline = (user: SocketUserData) => {
        console.log("Usuário online:", user.name);
        const convertedUser = convertSocketUserToUser(user);
        setUsersOnline((prev) => {
          const exists = prev.some((u) => u.id === user.id);
          if (exists) return prev;
          const newUsers = [...prev, convertedUser];
          setTimeout(() => {
            userStatusCallbacksRef.current.forEach((callback) =>
              callback(newUsers),
            );
          }, 0);
          return newUsers;
        });
      };
      const onUserOffline = (userId: string) => {
        console.log("Usuário offline:", userId);
        setUsersOnline((prev) => {
          const newUsers = prev.filter((user) => user.id !== userId);
          setTimeout(() => {
            userStatusCallbacksRef.current.forEach((callback) =>
              callback(newUsers),
            );
          }, 0);
          return newUsers;
        });
      };
      const onNewMessage = (message: MessageData) => {
        console.log("Nova mensagem recebida:", message);
        setMessages((prev) => [...prev, message]);
        messageCallbacksRef.current.forEach((callback) => callback(message));
      };
      socket.on(socketEvents.CONNECT, onConnect);
      socket.on(socketEvents.DISCONNECT, onDisconnect);
      socket.on(socketEvents.CONNECT_ERROR, onConnectError);
      socket.on(socketEvents.USERS_ONLINE, onUsersOnline);
      socket.on(socketEvents.NEW_MESSAGE, onNewMessage);
      socket.on(socketEvents.USER_ONLINE, onUserOnline);
      socket.on(socketEvents.USER_OFFLINE, onUserOffline);
      return () => {
        console.log("Limpando socket...");
        socket.off(socketEvents.CONNECT, onConnect);
        socket.off(socketEvents.DISCONNECT, onDisconnect);
        socket.off(socketEvents.CONNECT_ERROR, onConnectError);
        socket.off(socketEvents.USERS_ONLINE, onUsersOnline);
        socket.off(socketEvents.NEW_MESSAGE, onNewMessage);
        socket.off(socketEvents.USER_ONLINE, onUserOnline);
        socket.off(socketEvents.USER_OFFLINE, onUserOffline);
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [session?.token]);

  useEffect(() => {
    const messageCallbacks = messageCallbacksRef.current;
    const userStatusCallbacks = userStatusCallbacksRef.current;

    return () => {
      messageCallbacks.clear();
      userStatusCallbacks.clear();
    };
  }, []);

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    isConnected: socketState.isConnected,
    transport: socketState.transport,
    usersOnline,
    messages,
    sendMessage,
    clearMessages,
    onMessage,
    onUserStatusChange,
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
