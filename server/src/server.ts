import "dotenv/config";
import app from "./app";
import envs from "./config/envs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import prisma from "./db/prisma";
import jwt from "jsonwebtoken";
import { MessageData } from "./types/socketTypes";
import { socketEvents } from "./types/socketEvents";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: envs.FRONTEND_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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
  console.log(`User connected: ${currentUser.name} (${currentUser.id})`);
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { is_online: true, last_seen: new Date() },
  });
  const users = await prisma.user.findMany();
  const usersWithoutMe = users.filter((user) => user.id !== currentUser.id);
  const transformedUsers = usersWithoutMe.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    isOnline: user.is_online,
    lastSeen: user.last_seen,
    avatar: user.avatar,
  }));

  socket.emit(socketEvents.ONLINE_USERS, transformedUsers);

  socket.broadcast.emit(socketEvents.ONLINE_USER, {
    id: currentUser.id,
    name: currentUser.name,
    username: currentUser.username,
    isOnline: true,
    lastSeen: new Date(),
    avatar: currentUser.avatar,
  });

  socket.on(socketEvents.SEND_MESSAGE, async (data: MessageData) => {
    const message = await prisma.message.create({
      data: {
        content: data.content,
        sender_id: currentUser.id,
        receiver_id: data.receiverId,
      },
    });

    const messageToSend = {
      id: message.id,
      content: message.content,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      timestamp: message.created_at.toISOString(),
    };

    socket.broadcast.emit(socketEvents.NEW_MESSAGE, messageToSend);

    socket.emit(socketEvents.MESSAGE_SENT, messageToSend);
  });

  socket.on(socketEvents.HELLO, (data) => {
    console.log(data);
  });

  socket.on(socketEvents.DISCONNECT, async () => {
    const currentUser = socket.data.user;
    console.log(`User disconnected: ${currentUser.name} (${currentUser.id})`);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { is_online: false, last_seen: new Date() },
    });
    socket.broadcast.emit(socketEvents.OFFLINE_USER, currentUser.id);
  });
});

server.listen(envs.PORT, () => {
  console.log(`Server is running on port ${envs.PORT}`);
});
