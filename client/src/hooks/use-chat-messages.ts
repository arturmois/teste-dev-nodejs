import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";

import { useSocket } from "./use-socket";

export function useChatMessages() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const { messages, sendMessage, onMessage } = useSocket();

  const chatMessages = messages.filter((message) => {
    return message.senderId === userId || message.receiverId === userId;
  });

  const sendChatMessage = useCallback(
    (content: string, receiverId?: string) => {
      if (userId && receiverId) {
        sendMessage(content, receiverId);
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
