import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../../generated/prisma/index.js";

export function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    return res.status(500).json({ error: "JWT_SECRET não definido" });
  }

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  try {
    const payload = jwt.verify(token, secretKey);

    if (typeof payload !== "object" || payload === null) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = {
      id: payload.id as string,
      role: payload.role as Role,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}