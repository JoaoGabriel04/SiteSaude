import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    paciente?: {
      id: string;
    };
  }
}

export function pacienteSession(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.paciente_session;
  if (!token) {
    return res.status(401).json({ error: "Sessão do paciente ausente" });
  }

  const secret = process.env.PATIENT_SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "PATIENT_SESSION_SECRET não definido" });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload !== "object" || payload === null) {
      return res.status(401).json({ error: "Sessão inválida" });
    }

    const patientId = (payload as jwt.JwtPayload).sub;
    if (!patientId) {
      return res.status(401).json({ error: "Sessão inválida" });
    }

    req.paciente = { id: String(patientId) };
    return next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}

