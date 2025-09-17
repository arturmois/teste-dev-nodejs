import "dotenv/config";
import app from "./app";
import envs from "./config/envs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import prisma from "./db/prisma";
import jwt from "jsonwebtoken";

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

io.on("connection", async (socket) => {
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

  socket.emit("users", transformedUsers);

  socket.broadcast.emit("user_online", {
    id: currentUser.id,
    name: currentUser.name,
    username: currentUser.username,
    isOnline: true,
    lastSeen: new Date(),
    avatar: currentUser.avatar,
  });

  socket.on("hello", (data) => {
    console.log(data);
  });

  socket.on("disconnect", async () => {
    const currentUser = socket.data.user;
    console.log(`User disconnected: ${currentUser.name} (${currentUser.id})`);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { is_online: false, last_seen: new Date() },
    });
    socket.broadcast.emit("user_offline", currentUser.id);
  });
});

server.listen(envs.PORT, () => {
  console.log(`Server is running on port ${envs.PORT}`);
});
