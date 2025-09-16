import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1>Bem-vindo ao chat</h1>
      <div className="flex gap-4">
        <Button>
          <Link href="/auth/signin">Login</Link>
        </Button>
        <Button>
          <Link href="/auth/signup">Cadastro</Link>
        </Button>
      </div>
    </div>
  );
}
