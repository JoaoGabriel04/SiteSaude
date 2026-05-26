import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId: string;
}

let io: Server;

export function configureSocket(server: HTTPServer): Server {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://medflowgra.vercel.app"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token não fornecido"));
    }

    try {
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        return next(new Error("JWT_SECRET não definido"));
      }

      const payload = jwt.verify(token, secretKey);

      if (typeof payload !== "object" || !payload || !payload.sub) {
        return next(new Error("Token inválido"));
      }

      (socket as AuthenticatedSocket).userId = payload.sub as string;
      next();
    } catch {
      return next(new Error("Token inválido ou expirado"));
    }
  });

  io.on("connection", (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;
    authSocket.join(userId);
    console.log(`[Socket] Usuário ${userId} conectado`);

    socket.on("disconnect", () => {
      console.log(`[Socket] Usuário ${userId} desconectado`);
    });
  });

  return io;
}

export function emitirNotificacao(userId: string, notificacao: unknown) {
  if (io) {
    io.to(userId).emit("nova-notificacao", notificacao);
  }
}
