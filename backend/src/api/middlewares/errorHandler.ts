import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError.js";
import { ZodError } from "zod"; // se usar Zod
import { Prisma } from "../../../generated/prisma/index.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erros de negócio conhecidos
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erros de validação (se usar Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.issues,
    });
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Registro duplicado" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
  }

  // Fallback — erro inesperado
  console.error("[UNHANDLED ERROR]", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    error: "Erro interno do servidor",
  });
}