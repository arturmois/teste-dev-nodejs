import { useSession } from "next-auth/react";
import { useCallback } from "react";

import { useSocket } from "./use-socket";

export function useChatMessages() {
  const { data: session } = useSession();
  const { messages, sendMessage } = useSocket();

  const sendChatMessage = useCallback(
    (content: string, receiverId: string) => {
      if (session?.user?.id && receiverId) {
        sendMessage(content, receiverId);
      }
    },
    [sendMessage, session?.user?.id],
  );

  return {
    messages,
    sendMessage: sendChatMessage,
  };
}
