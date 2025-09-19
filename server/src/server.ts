import "dotenv/config";
import app, { sessionMiddleware } from "./app";
import envs from "./config/envs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import passport from "./config/passport";
import prisma from "./db/prisma";
import { MessageData, Message, SocketUserData } from "./types/socketTypes";
import { socketEvents } from "./types/socketEvents";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [envs.CLIENT_URL, "http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

function onlyForHandshake(middleware: any) {
  return (req: any, res: any, next: any) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.initialize()));
io.engine.use(onlyForHandshake(passport.session()));

io.engine.use(
  onlyForHandshake((req: any, res: any, next: any) => {
    if (req.user) {
      next();
    } else {
      console.log("Socket handshake failed: No authenticated user");
      res.writeHead(401);
      res.end();
    }
  })
);

io.on(socketEvents.CONNECT, async (socket) => {
  console.log("New socket connection attempt from:", socket.handshake.address);
  const authenticatedUser = (socket.request as any).user;

  if (!authenticatedUser) {
    console.log("Socket disconnected: No authenticated user");
    socket.disconnect();
    return;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: authenticatedUser.id },
  });

  if (!currentUser) {
    socket.disconnect();
    return;
  }

  console.log(`User connected: ${currentUser.name} (${currentUser.id})`);

  socket.join(`user:${currentUser.id}`);

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

server.listen(envs.PORT, () => {
  console.log(`Server running on port ${envs.PORT}`);
});
