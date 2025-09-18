"use client";

import { Paperclip, Send, Smile } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/use-chat-messages";
import type { MessageData, SocketUserData } from "@/types/socketTypes";

interface ChatAreaProps {
  selectedUser?: SocketUserData;
}

export function ChatArea({ selectedUser }: ChatAreaProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { messages: socketMessages, sendMessage: sendSocketMessage } =
    useChatMessages();
  const filteredMessages = useMemo(() => {
    if (!selectedUser?.id) return [];
    return socketMessages.filter(
      (msg: MessageData) =>
        (msg.senderId === selectedUser.id &&
          msg.receiverId === session?.user.id) ||
        (msg.senderId === session?.user.id &&
          msg.receiverId === selectedUser.id),
    );
  }, [socketMessages, selectedUser?.id, session?.user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    sendSocketMessage(newMessage.trim(), selectedUser.id);
    setNewMessage("");
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!selectedUser) {
    return (
      <div className="bg-background flex h-full flex-1 items-center justify-center">
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
            <Send className="text-muted-foreground h-12 w-12" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Selecione uma conversa
          </h3>
          <p className="text-muted-foreground">
            Escolha um usuário da lista para começar a conversar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="bg-sidebar flex items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={selectedUser.avatar || "/placeholder.svg"}
            alt={selectedUser.name}
          />
          <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-card-foreground font-semibold">
            {selectedUser.name}
          </h2>
          <p className="text-muted-foreground text-xs">Online</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-orange-100">
        <ScrollArea className="h-full p-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const isCurrentUser = message.senderId === session?.user.id;
              const sender = isCurrentUser ? session?.user : selectedUser;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={sender?.avatar || "/placeholder.svg"}
                      alt={sender?.name || "User"}
                    />
                    <AvatarFallback>
                      {sender?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 lg:max-w-md ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground border-border border"
                      } `}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-muted-foreground mt-1 text-xs">
                      {formatTime(new Date(message.timestamp))}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="bg-background border-border sticky bottom-0 border-t p-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-10 pr-10"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
