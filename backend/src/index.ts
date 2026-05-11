import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser"
import apiRouter from "./api/routes/index.js"
import cors from "cors";
import { getMasterAdminId } from "./utils/getMasterAdmin.js";
import { errorHandler } from "./api/middlewares/errorHandler.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,                  // 300 requests por IP nesse período
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter, apiRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Error handler — SEMPRE por último
app.use(errorHandler);

async function bootstrap() {
  try {
    const adminId = await getMasterAdminId();
    console.log(`✅ Master admin OK!`);
  } catch (err) {
    console.error("❌ Master admin não existe. Rode: npx prisma db seed");
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
}

bootstrap();
