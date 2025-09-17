import "dotenv/config";
import app from "./app";
import envs from "./config/envs";
import { createServer } from "node:http";
import { Server } from "socket.io";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: envs.FRONTEND_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

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
