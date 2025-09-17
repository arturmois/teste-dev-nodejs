import "dotenv/config";
import app from "./app";
import envs from "./config/envs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import prisma from "./db/prisma";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: envs.FRONTEND_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`);

  const users = await prisma.user.findMany();
  const usersWithoutMe = users.filter((user) => user.id !== socket.id);
  const transformedUsers = usersWithoutMe.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    isOnline: user.is_online,
    lastSeen: user.last_seen,
    avatar: user.avatar,
  }));
  console.log(transformedUsers);
  socket.emit("online_users", transformedUsers);

  socket.on("hello", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(envs.PORT, () => {
  console.log(`Server is running on port ${envs.PORT}`);
});
