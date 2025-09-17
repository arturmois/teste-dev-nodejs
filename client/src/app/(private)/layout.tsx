import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SocketProvider } from "@/contexts/socket-context";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout = async ({ children }: PrivateLayoutProps) => {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return <SocketProvider>{children}</SocketProvider>;
};

export default PrivateLayout;
