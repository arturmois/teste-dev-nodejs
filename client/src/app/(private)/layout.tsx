import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout = async ({ children }: PrivateLayoutProps) => {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return <>{children}</>;
};

export default PrivateLayout;
