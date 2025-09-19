import { useCallback } from "react";

import { useAuth } from "@/contexts/auth-context";

import { useSocket } from "./use-socket";

export function useChatMessages() {
  const { user } = useAuth();
  const { messages, sendMessage } = useSocket();

  const sendChatMessage = useCallback(
    (content: string, receiverId: string) => {
      if (user?.id && receiverId) {
        sendMessage(content, receiverId);
      }
    },
    [sendMessage, user?.id],
  );

  return {
    messages,
    sendMessage: sendChatMessage,
  };
}
