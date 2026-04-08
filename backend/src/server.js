import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { setSocketServer } from "./services/socketService.js";

const app = createApp();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.frontendUrl,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.emit("connection:ready", {
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

setSocketServer(io);

server.listen(env.port, env.host, () => {
  console.log(`Smart Accident backend listening on http://${env.host}:${env.port}`);
});
