"use client";

import { useSession } from "next-auth/react";

import ButtonLogout from "@/components/common/button-logout";

const ChatPage = () => {
  const { data } = useSession();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>Chat</h1>
      <p>Bem-vindo, {JSON.stringify(data?.user.name)}</p>
      <ButtonLogout />
    </div>
  );
};

export default ChatPage;
