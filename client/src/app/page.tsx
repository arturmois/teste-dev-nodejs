import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="ChatApp"
              width={64}
              height={64}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild>
              <Link href="/auth/signin">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-foreground mb-6 text-5xl font-bold text-balance md:text-6xl">
            Conecte-se Instantaneamente.
            <br />
            <span className="text-primary">Comunique-se Sem Esforço.</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl text-pretty">
            Experimente a comunicação em tempo real com nossa plataforma de chat
            moderna. Simples, rápida e segura para todas as suas conversas.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-8 py-3 text-lg" asChild>
              <Link href="/auth/signin">Entrar</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent px-8 py-3 text-lg"
              asChild
            >
              <Link href="/auth/signup">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
