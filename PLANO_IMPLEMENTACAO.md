# 📋 Plano de Implementação Atualizado - Chat em Tempo Real

## 🎯 Cronograma de 3 Dias com Tecnologias Modernas

**Stack Atualizada:**

- **Backend:** Node.js + TypeScript + Express + Socket.io + MongoDB + Prisma ORM + JWT + bcrypt + Zod + Jest
- **Frontend:** Next.js + TypeScript + shadcn/ui + React Hook Form + Zod + TanStack Query
- **DevOps:** Docker + Cluster Node.js + dotenv

---

### 🔥 DIA 1 - Backend e Configuração (8h)

#### Manhã (4h) - Setup e Estrutura

- [ ] **1.1 Configuração Inicial (1h)**

  ```bash
  # Criar estrutura do projeto
  mkdir teste-dev-nodejs-ixc
  cd teste-dev-nodejs-ixc
  mkdir backend frontend

  # Inicializar Git
  git init
  echo "node_modules\n.env\n*.log\ndist/" > .gitignore
  ```

  - [x ] Criar estrutura de pastas (backend + frontend)
  - [x ] Inicializar repositório Git
  - [x ] Configurar .gitignore
  - [x ] Criar package.json para backend

- [ ] **1.2 Database Setup (1h)**

  ```bash
  # MongoDB local (Docker)
  docker run -d --name mongodb -p 27017:27017 mongo:7.0

  # Ou MongoDB Atlas (cloud)
  # Criar cluster no MongoDB Atlas
  # Copiar connection string
  ```

  - [x ] Configurar MongoDB (local ou Atlas)
  - [x ] Configurar Prisma ORM com MongoDB
  - [x ] Definir schema do banco no schema.prisma
  - [x ] Gerar Prisma Client
  - [x ] Testar conectividade

- [ ] **1.3 Dependências Backend (1h)**

  ```bash
  cd backend
  npm init -y

  # TypeScript e ferramentas de desenvolvimento
  npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors
  npm install -D nodemon ts-node jest @types/jest ts-jest supertest @types/supertest

  # Dependências principais
  npm install express socket.io prisma @prisma/client
  npm install bcryptjs jsonwebtoken zod
  npm install dotenv cors helmet express-rate-limit

  # Inicializar TypeScript
  npx tsc --init

  # Configurar Prisma
  npx prisma init
  ```

  - [x ] Configurar TypeScript com ts-node e tipos
  - [x ] Instalar Express.js, Socket.io, Prisma ORM
  - [x ] Instalar bcryptjs, jsonwebtoken, cors, helmet, zod
  - [x ] Configurar Jest com TypeScript (ts-jest)
  - [x ] Configurar scripts no package.json

- [ ] **1.4 Estrutura Base (1h)**

  ```typescript
  // backend/src/server.ts
  import express from "express";
  import cors from "cors";
  import helmet from "helmet";
  import { createServer } from "http";
  import { Server } from "socket.io";
  import dotenv from "dotenv";
  import { PrismaClient } from "@prisma/client";

  dotenv.config();

  const app = express();
  const server = createServer(app);
  const prisma = new PrismaClient();
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL },
  });

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```

  - [x ] Criar servidor Express com TypeScript
  - [x ] Configurar middlewares essenciais
  - [x ] Integrar Prisma Client
  - [x ] Configurar variáveis de ambiente
  - [x ] Estruturar pastas (controllers, models, routes, etc.)

#### Tarde (4h) - Modelos e Autenticação

- [ ] **1.5 Modelos de Dados com Prisma (1.5h)**

  ```prisma
  // backend/prisma/schema.prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
  }

  model User {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    name      String
    username  String   @unique
    password  String
    isOnline  Boolean  @default(false)
    lastSeen  DateTime @default(now())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    sentMessages     Message[] @relation("Sender")
    receivedMessages Message[] @relation("Receiver")

    @@map("users")
  }

  model Message {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    content   String
    read      Boolean  @default(false)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    senderId   String @db.ObjectId
    receiverId String @db.ObjectId

    sender   User @relation("Sender", fields: [senderId], references: [id])
    receiver User @relation("Receiver", fields: [receiverId], references: [id])

    @@map("messages")
  }
  ```

  ```typescript
  // backend/src/schemas/user.schema.ts
  import { z } from "zod";

  export const createUserSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  });

  export const loginUserSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  export type CreateUserInput = z.infer<typeof createUserSchema>;
  export type LoginUserInput = z.infer<typeof loginUserSchema>;
  ```

  - [x ] Definir schema Prisma com User e Message
  - [x ] Configurar relacionamentos no Prisma
  - [x ] Criar schemas de validação com Zod
  - [x ] Gerar Prisma Client
  - [x ] Executar npx prisma db push

- [ ] **1.6 Sistema de Autenticação JWT com TypeScript (2.5h)**

  ```typescript
  // backend/src/controllers/authController.ts
  import { Request, Response } from "express";
  import jwt from "jsonwebtoken";
  import bcrypt from "bcryptjs";
  import { PrismaClient } from "@prisma/client";
  import { createUserSchema, loginUserSchema } from "../schemas/user.schema";

  const prisma = new PrismaClient();

  export const register = async (req: Request, res: Response) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const { name, username, password } = validatedData;

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username já existe",
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
        },
      });

      // Gerar JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      res.status(201).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, username: user.username },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  export const login = async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const { username, password } = validatedData;

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      // Atualizar status online
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true, lastSeen: new Date() },
      });

      // Gerar JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, username: user.username },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  ```

  ```typescript
  // backend/src/middleware/auth.ts
  import { Request, Response, NextFunction } from "express";
  import jwt from "jsonwebtoken";
  import { PrismaClient } from "@prisma/client";

  const prisma = new PrismaClient();

  interface AuthRequest extends Request {
    user?: any;
  }

  export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido" });
    }
  };
  ```

  - [x ] Implementar controllers com TypeScript e Prisma
  - [x ] Validação de dados com Zod
  - [x ] Hash de senha com bcrypt
  - [x ] Geração e validação de JWT
  - [x ] Middleware de autenticação tipado
  - [x ] Tratamento de erros adequado

---

### ⚡ DIA 2 - Frontend e Integração (8h)

#### Manhã (4h) - Setup Frontend

- [ ] **2.1 Configuração Next.js + shadcn/ui (1h)**

  ```bash
  cd frontend
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

  # Configurar shadcn/ui
  npx shadcn@latest init

  # Instalar componentes necessários
  npx shadcn@latest add form input button card
  npx shadcn@latest add toast dialog avatar
  ```

  - [x ] Criar projeto Next.js com App Router
  - [x ] Configurar TypeScript e Tailwind CSS
  - [x ] Instalar e configurar shadcn/ui
  - [x ] Configurar estrutura de componentes

- [ ] **2.2 Dependências e Configurações (1h)**

  ```bash
  # Instalar dependências para forms e auth
  npm install react-hook-form @hookform/resolvers zod
  npm install @tanstack/react-query @tanstack/react-query-devtools
  npm install socket.io-client
  npm install axios lucide-react
  npm install @types/node @types/react @types/react-dom

  # Configurar shadcn/ui
  npx shadcn@latest init
  npx shadcn@latest add form input button card toast dialog avatar
  ```

  - [ ] Instalar React Hook Form + Zod
  - [ ] Instalar TanStack Query (React Query)
  - [ ] Instalar Socket.io client
  - [ ] Configurar shadcn/ui components
  - [ ] Configurar tipos TypeScript

- [ ] **2.3 Configuração TanStack Query (1h)**

  ```typescript
  // app/providers.tsx
  "use client";

  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
  import { useState, ReactNode } from "react";

  interface ProvidersProps {
    children: ReactNode;
  }

  export default function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000, // 1 minuto
              retry: 1,
            },
          },
        })
    );

    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }
  ```

  ```typescript
  // lib/api.ts
  import axios from "axios";

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  });

  // Interceptor para adicionar token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  export default api;
  ```

  - [ ] Configurar TanStack Query Provider
  - [ ] Configurar axios com interceptors
  - [ ] Configurar React Query DevTools
  - [ ] Definir configurações padrão de cache

- [ ] **2.4 Formulários com shadcn/ui + Zod + TanStack Query (1h)**

  ```typescript
  // components/LoginForm.tsx
  "use client";

  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { useMutation } from "@tanstack/react-query";
  import { useRouter } from "next/navigation";
  import api from "@/lib/api";

  import { Button } from "@/components/ui/button";
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { useToast } from "@/components/ui/use-toast";

  const loginSchema = z.object({
    username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
    password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  export function LoginForm() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        username: "",
        password: "",
      },
    });

    const loginMutation = useMutation({
      mutationFn: async (data: LoginFormData) => {
        const response = await api.post("/api/auth/login", data);
        return response.data;
      },
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.name}`,
        });
        router.push("/chat");
      },
      onError: (error: any) => {
        toast({
          title: "Erro no login",
          description: error.response?.data?.message || "Erro inesperado",
          variant: "destructive",
        });
      },
    });

    async function onSubmit(values: LoginFormData) {
      loginMutation.mutate(values);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
    );
  }
  ```

  - [ ] Criar formulário de login com TanStack Query
  - [ ] Criar formulário de cadastro com mutations
  - [ ] Integrar toasts para feedback
  - [ ] Gerenciar estado de loading

#### Tarde (4h) - Interface do Chat

- [ ] **2.5 Layout Principal do Chat com TanStack Query (2h)**

  ```typescript
  // app/chat/page.tsx
  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import { useQuery } from "@tanstack/react-query";
  import api from "@/lib/api";
  import { ChatInterface } from "@/components/chat/ChatInterface";
  import { UsersList } from "@/components/chat/UsersList";
  import { MessagesList } from "@/components/chat/MessagesList";
  import { MessageInput } from "@/components/chat/MessageInput";
  import { ChatHeader } from "@/components/chat/ChatHeader";

  interface User {
    id: string;
    name: string;
    username: string;
    isOnline: boolean;
  }

  export default function ChatPage() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        router.push("/login");
        return;
      }

      setCurrentUser(JSON.parse(user));
    }, [router]);

    // Query para buscar usuários online
    const { data: users, isLoading } = useQuery({
      queryKey: ["users"],
      queryFn: async () => {
        const response = await api.get("/api/users");
        return response.data.users as User[];
      },
      enabled: !!currentUser,
      refetchInterval: 5000, // Atualizar a cada 5 segundos
    });

    if (!currentUser) {
      return <div>Carregando...</div>;
    }

    return (
      <div className="h-screen flex bg-background">
        <div className="w-1/4 border-r bg-muted/50">
          <UsersList
            users={users || []}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            currentUser={currentUser}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatHeader selectedUser={selectedUser} currentUser={currentUser} />
          <div className="flex-1 overflow-y-auto p-4">
            <MessagesList
              selectedUser={selectedUser}
              currentUser={currentUser}
            />
          </div>
          <div className="border-t p-4">
            <MessageInput
              selectedUser={selectedUser}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    );
  }
  ```

  - [ ] Layout responsivo do chat com shadcn/ui
  - [ ] Query para buscar usuários online
  - [ ] Estado para usuário selecionado
  - [ ] Proteção de rota com verificação de token
  - [ ] Refetch automático de usuários

- [ ] **2.6 Componentes do Chat (2h)**

  ```typescript
  // components/chat/MessageInput.tsx
  "use client";

  import { useState } from "react";
  import { useSession } from "next-auth/react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Send } from "lucide-react";

  export function MessageInput({
    onSendMessage,
  }: {
    onSendMessage: (message: string) => void;
  }) {
    const [message, setMessage] = useState("");
    const { data: session } = useSession();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && session) {
        onSendMessage(message.trim());
        setMessage("");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    );
  }
  ```

  - [ ] Componente de input de mensagem
  - [ ] Lista de mensagens com scroll automático
  - [ ] Lista de usuários com status
  - [ ] Avatar e indicadores visuais

---

### 🎯 DIA 3 - Chat Tempo Real e Finalização (8h)

#### Manhã (4h) - Socket.io e Chat

- [ ] **3.1 Socket.io Backend (2h)**

  ```javascript
  // backend/src/socket/socketHandler.js
  import jwt from "jsonwebtoken";
  import User from "../models/User.js";
  import Message from "../models/Message.js";

  const connectedUsers = new Map();

  export const handleSocketConnection = (io) => {
    // Middleware de autenticação
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
          return next(new Error("Authentication error"));
        }

        socket.userId = user._id.toString();
        socket.username = user.username;
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`User ${socket.username} connected`);

      // Adicionar usuário à lista de conectados
      connectedUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        userId: socket.userId,
      });

      // Atualizar status online
      User.findByIdAndUpdate(socket.userId, { isOnline: true });

      // Enviar lista de usuários online
      io.emit("users_online", Array.from(connectedUsers.values()));

      // Eventos de mensagem
      socket.on("send_message", async (data) => {
        try {
          const message = await Message.create({
            sender: socket.userId,
            receiver: data.receiverId,
            content: data.content,
          });

          await message.populate(["sender", "receiver"]);

          // Enviar para o destinatário
          const receiverSocket = connectedUsers.get(data.receiverId);
          if (receiverSocket) {
            io.to(receiverSocket.socketId).emit("new_message", message);
          }

          // Confirmar para o remetente
          socket.emit("message_sent", message);
        } catch (error) {
          socket.emit("message_error", { error: error.message });
        }
      });

      // Evento de digitação
      socket.on("typing", (data) => {
        const receiverSocket = connectedUsers.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit("user_typing", {
            userId: socket.userId,
            username: socket.username,
          });
        }
      });

      // Desconexão
      socket.on("disconnect", async () => {
        console.log(`User ${socket.username} disconnected`);
        connectedUsers.delete(socket.userId);

        // Atualizar status offline
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Notificar outros usuários
        io.emit("users_online", Array.from(connectedUsers.values()));
      });
    });
  };
  ```

  - [ ] Configurar servidor Socket.io
  - [ ] Middleware de autenticação Socket.io
  - [ ] Eventos de conexão/desconexão
  - [ ] Gerenciamento de usuários online

- [ ] **3.2 Mensagens em Tempo Real (2h)**

  ```javascript
  // backend/src/routes/messages.js
  import express from "express";
  import Message from "../models/Message.js";
  import { authMiddleware } from "../middleware/auth.js";

  const router = express.Router();

  // Buscar histórico de mensagens
  router.get("/history/:userId", authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId },
        ],
      })
        .populate(["sender", "receiver"])
        .sort({ createdAt: 1 })
        .limit(50);

      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Marcar mensagens como lidas
  router.put("/mark-read/:messageId", authMiddleware, async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      await Message.findOneAndUpdate(
        { _id: messageId, receiver: userId },
        { read: true }
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  export default router;
  ```

  - [ ] Evento de envio de mensagem
  - [ ] Persistência no MongoDB
  - [ ] Broadcast para usuários conectados
  - [ ] API de histórico de mensagens

#### Tarde (4h) - Funcionalidades Finais

- [ ] **3.3 Socket.io Frontend (1.5h)**

  ```typescript
  // hooks/useSocket.ts
  "use client";

  import { useEffect, useState } from "react";
  import { useSession } from "next-auth/react";
  import { io, Socket } from "socket.io-client";

  export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [usersOnline, setUsersOnline] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
      if (session?.accessToken) {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          auth: {
            token: session.accessToken,
          },
        });

        socketInstance.on("connect", () => {
          console.log("Connected to server");
          setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
        });

        socketInstance.on("users_online", (users) => {
          setUsersOnline(users);
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.close();
        };
      }
    }, [session]);

    const sendMessage = (receiverId: string, content: string) => {
      if (socket) {
        socket.emit("send_message", { receiverId, content });
      }
    };

    const sendTyping = (receiverId: string) => {
      if (socket) {
        socket.emit("typing", { receiverId });
      }
    };

    return {
      socket,
      isConnected,
      usersOnline,
      sendMessage,
      sendTyping,
    };
  }
  ```

  - [ ] Hook customizado para Socket.io
  - [ ] Gerenciamento de conexão
  - [ ] Eventos de mensagens
  - [ ] Status de usuários online/offline

- [ ] **3.4 Funcionalidades Extras (1.5h)**

  ```typescript
  // components/chat/TypingIndicator.tsx
  "use client";

  import { useEffect, useState } from "react";
  import { useSocket } from "@/hooks/useSocket";

  export function TypingIndicator({
    currentChatUser,
  }: {
    currentChatUser: string;
  }) {
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const { socket } = useSocket();

    useEffect(() => {
      if (socket) {
        socket.on("user_typing", (data) => {
          if (data.userId === currentChatUser) {
            setTypingUser(data.username);

            // Limpar após 3 segundos
            setTimeout(() => {
              setTypingUser(null);
            }, 3000);
          }
        });
      }

      return () => {
        if (socket) {
          socket.off("user_typing");
        }
      };
    }, [socket, currentChatUser]);

    if (!typingUser) return null;

    return (
      <div className="text-sm text-gray-500 italic p-2">
        {typingUser} está digitando...
      </div>
    );
  }
  ```

  - [ ] Notificações de novas mensagens
  - [ ] Indicador "digitando..."
  - [ ] Scroll automático no chat
  - [ ] Timestamp das mensagens

- [ ] **3.5 Docker e Deploy (1h)**

  ```yaml
  # docker-compose.yml
  version: "3.8"

  services:
    mongodb:
      image: mongo:7.0
      container_name: chat_mongodb
      restart: unless-stopped
      environment:
        MONGO_INITDB_DATABASE: chatapp
      ports:
        - "27017:27017"
      volumes:
        - mongodb_data:/data/db

    backend:
      build: ./backend
      container_name: chat_backend
      restart: unless-stopped
      ports:
        - "3001:3001"
      environment:
        NODE_ENV: production
        MONGODB_URI: mongodb://mongodb:27017/chatapp
        JWT_SECRET: your-super-secret-key
        FRONTEND_URL: http://localhost:3000
      depends_on:
        - mongodb
      volumes:
        - ./backend/logs:/app/logs

    frontend:
      build: ./frontend
      container_name: chat_frontend
      restart: unless-stopped
      ports:
        - "3000:3000"
      environment:
        NEXT_PUBLIC_API_URL: http://localhost:3001
        NEXT_PUBLIC_SOCKET_URL: http://localhost:3001
        NEXTAUTH_SECRET: your-nextauth-secret
        NEXTAUTH_URL: http://localhost:3000
      depends_on:
        - backend

  volumes:
    mongodb_data:
  ```

  ```javascript
  // backend/cluster.js
  import cluster from "cluster";
  import os from "os";

  const numCPUs = os.cpus().length;

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    // Workers can share any TCP connection
    import("./src/server.js");
    console.log(`Worker ${process.pid} started`);
  }
  ```

  - [ ] Dockerfile para backend e frontend
  - [ ] docker-compose.yml completo
  - [ ] Configurar cluster Node.js
  - [ ] Variáveis de ambiente para produção

---

## 📊 Checklist de Funcionalidades Atualizadas

### Backend ✅

- [ ] **Configuração Base TypeScript + Prisma**

  - [ ] Configurar TypeScript e ts-node
  - [ ] Configurar Prisma ORM com MongoDB
  - [ ] Definir schemas do banco de dados
  - [ ] Configurar Jest com ts-jest para testes

- [ ] **Cadastro e Login JWT**

  - [ ] Rota POST /api/auth/register
  - [ ] Rota POST /api/auth/login
  - [ ] Middleware de autenticação JWT tipado
  - [ ] Validação com Zod schemas

- [ ] **Socket.io Real-time**

  - [ ] Autenticação via Socket.io
  - [ ] Eventos de mensagem tipados
  - [ ] Status online/offline
  - [ ] Persistência com Prisma

- [ ] **APIs RESTful**
  - [ ] GET /api/users (lista usuários)
  - [ ] GET /api/messages/history/:userId
  - [ ] PUT /api/messages/mark-read/:id
  - [ ] Testes unitários com Jest

### Frontend ✅

- [ ] **Estado e Autenticação TanStack Query**

  - [ ] Configuração do QueryClient Provider
  - [ ] Mutations para login/cadastro
  - [ ] Cache de dados de usuários
  - [ ] Interceptors do Axios

- [ ] **Interface shadcn/ui + TypeScript**

  - [ ] Formulários com React Hook Form + Zod
  - [ ] Componentes tipados reutilizáveis
  - [ ] Layout responsivo
  - [ ] Sistema de toasts para feedback

- [ ] **Chat em Tempo Real**
  - [ ] Socket.io client integrado
  - [ ] Lista de usuários com queries
  - [ ] Mensagens em tempo real
  - [ ] Indicadores visuais e loading states

### DevOps ✅

- [ ] **Docker**

  - [ ] Dockerfile backend/frontend
  - [ ] docker-compose.yml
  - [ ] MongoDB containerizado

- [ ] **Produção**
  - [ ] Cluster Node.js
  - [ ] Variáveis de ambiente
  - [ ] Logs estruturados

---

## 🎯 Comandos Úteis Atualizados

### Desenvolvimento

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# MongoDB (Docker)
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

### shadcn/ui

```bash
# Instalar componentes
npx shadcn@latest add form input button card
npx shadcn@latest add toast dialog avatar badge

# Ver componentes disponíveis
npx shadcn@latest add --help
```

### Docker

```bash
# Subir ambiente completo
docker-compose up -d

# Logs em tempo real
docker-compose logs -f

# Reconstruir containers
docker-compose up --build
```

### Git (Sugestão de commits)

```bash
git add . && git commit -m "feat: Day 1 - Backend setup with JWT auth"
git add . && git commit -m "feat: Day 2 - Frontend with shadcn/ui and NextAuth"
git add . && git commit -m "feat: Day 3 - Real-time chat with Socket.io"
```

---

## 🚀 Stack Final Atualizada

| Categoria            | Tecnologia                     | Versão     | Motivo                    |
| -------------------- | ------------------------------ | ---------- | ------------------------- |
| **Backend**          | Node.js + TypeScript + Express | Latest     | API REST tipada           |
| **Real-time**        | Socket.io                      | 4.x        | WebSocket robusto         |
| **Database**         | MongoDB + Prisma ORM           | 7.x        | ORM type-safe moderno     |
| **Auth Backend**     | JWT + bcrypt + Zod             | Latest     | Autenticação validada     |
| **Testing**          | Jest + ts-jest                 | Latest     | Testes unitários          |
| **Frontend**         | Next.js 14 + TypeScript        | App Router | SSR e type-safety         |
| **UI Library**       | shadcn/ui                      | Latest     | Componentes acessíveis    |
| **Forms**            | React Hook Form + Zod          | Latest     | Validação type-safe       |
| **State Management** | TanStack Query                 | v5         | Server state management   |
| **HTTP Client**      | Axios                          | Latest     | Cliente HTTP robusto      |
| **Styling**          | Tailwind CSS                   | Latest     | CSS utilitário            |
| **Icons**            | Lucide React                   | Latest     | Ícones consistentes       |
| **Environment**      | dotenv                         | Latest     | Gerenciamento de env vars |

---

**🎯 Objetivo**: Entregar aplicação moderna, type-safe e escalável em 72 horas!

**📈 Progresso**: [ ] 0% - Ready to start with modern stack!
