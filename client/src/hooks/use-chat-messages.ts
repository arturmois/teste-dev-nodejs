import { useCallback, useEffect } from "react";

import { useSocket } from "./use-socket";

export function useChatMessages(userId?: string) {
  const { messages, sendMessage, onMessage } = useSocket();
  const chatMessages = messages.filter(
    (message) => message.senderId === userId || message.receiverId === userId,
  );
  const sendChatMessage = useCallback(
    (content: string) => {
      if (userId) {
        sendMessage(content, userId);
      }
    },
    [sendMessage, userId],
  );

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = onMessage(() => {});
    return unsubscribe;
  }, [userId, onMessage]);

  return {
    messages: chatMessages,
    sendMessage: sendChatMessage,
  };
}
