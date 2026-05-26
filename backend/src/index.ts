import "dotenv/config";

import http from "http";
import express from "express";
import cookieParser from "cookie-parser"
import apiRouter from "./api/routes/index.js"
import cors from "cors";
import { getMasterAdminId } from "./utils/getMasterAdmin.js";
import { errorHandler } from "./api/middlewares/errorHandler.js";
import { configureSocket } from "./lib/socket.js";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 7000;

const urlsAllowed = [
  "http://localhost:3000",
  "https://medflowgra.vercel.app",
]

app.use(helmet());

app.use(cors({
  origin: urlsAllowed,
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter, apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use(errorHandler);

const server = http.createServer(app);

configureSocket(server);

async function bootstrap() {
  try {
    const adminId = await getMasterAdminId();
    console.log(`✅ Master admin OK!`);
  } catch (err) {
    console.error("❌ Master admin não existe. Rode: npx prisma db seed");
    process.exit(1);
  }

  server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
}

bootstrap();
