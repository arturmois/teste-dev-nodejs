import "dotenv/config";
import cluster from "cluster";
import http from "http";
import { Server } from "socket.io";
import os from "os";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import prisma from "./db/prisma";
import type { Message, MessageData, SocketUserData } from "./types/socketTypes";
import { socketEvents } from "./types/socketEvents";
import envs from "./config/envs";
import jwt from "jsonwebtoken";
import app from "./app";

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const httpServer = http.createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  setupPrimary();

  cluster.setupPrimary({
    serialization: "advanced",
  });

  httpServer.listen(envs.PORT);

  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: envs.FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.adapter(createAdapter());

  setupWorker(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("No token provided"));
      }
      const decoded = jwt.verify(token, envs.JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on(socketEvents.CONNECT, async (socket) => {
    const currentUser = socket.data.user;
    console.log(`user connected: ${currentUser.name} (${currentUser.id})`);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { is_online: true, last_seen: new Date() },
    });

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      orderBy: {
        is_online: "desc",
      },
    });

    const transformedUsers: SocketUserData[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      avatar: user.avatar || "",
    }));

    socket.emit("onlineUsers", transformedUsers);

    socket.broadcast.emit("onlineUser", {
      id: currentUser.id,
      name: currentUser.name,
      username: currentUser.username,
      isOnline: true,
      lastSeen: new Date(),
      avatar: currentUser.avatar || "",
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: currentUser.id }, { receiver_id: currentUser.id }],
      },
      orderBy: {
        created_at: "asc",
      },
      take: 100,
    });

    if (messages.length > 0) {
      const transformedMessages: Message[] = messages.map((message) => ({
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        timestamp: message.created_at.toISOString(),
      }));
      socket.emit("messagesHistory", transformedMessages);
    }

    socket.on("sendMessage", async (data: MessageData) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            sender_id: currentUser.id,
            receiver_id: data.receiverId,
          },
        });

        const messageToSend: Message = {
          id: message.id,
          content: message.content,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          timestamp: message.created_at.toISOString(),
        };

        socket.emit("messageSent", messageToSend);
        socket.broadcast.emit("newMessage", messageToSend);
      } catch (error) {
        console.error("error sending message:", error);
        socket.emit("error", "Error sending message");
      }
    });

    socket.on("disconnect", async () => {
      console.log(`user disconnected: ${currentUser.name} (${currentUser.id})`);

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { is_online: false, last_seen: new Date() },
      });

      socket.broadcast.emit("offlineUser", currentUser.id);
    });
  });
}
