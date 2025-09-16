"use client";

import { Paperclip, Send, Smile } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  lastSeen?: Date;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text";
}

interface ChatAreaProps {
  selectedUser?: User;
  currentUser: User;
}

// Mock messages para demonstração
const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    content: "Oi! Como você está?",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: "text",
  },
  {
    id: "2",
    senderId: "1",
    content: "Oi Maria! Estou bem, obrigado. E você?",
    timestamp: new Date(Date.now() - 9 * 60 * 1000),
    type: "text",
  },
  {
    id: "3",
    senderId: "2",
    content: "Também estou bem! Você viu o projeto que enviaram hoje?",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    type: "text",
  },
  {
    id: "4",
    senderId: "1",
    content:
      "Sim, vi! Parece interessante. Podemos conversar sobre isso amanhã?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: "text",
  },
];

export function ChatArea({ selectedUser, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
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
      {/* Área de mensagens com altura fixa */}
      <div className="flex-1 overflow-hidden bg-orange-100">
        <ScrollArea className="h-full p-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser.id;
              const sender = isCurrentUser ? currentUser : selectedUser;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={sender.avatar || "/placeholder.svg"}
                      alt={sender.name}
                    />
                    <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
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
                      {formatTime(message.timestamp)}
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
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="relative flex-1">
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 transform"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
