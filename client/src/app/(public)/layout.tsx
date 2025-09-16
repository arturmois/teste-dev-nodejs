import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout = async ({ children }: PublicLayoutProps) => {
  const session = await getServerSession();
  if (session) {
    redirect("/chat");
  }
  return <>{children}</>;
};

export default PublicLayout;
