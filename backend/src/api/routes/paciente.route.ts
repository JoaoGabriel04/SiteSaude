import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { validate } from "../middlewares/validate.js";
import { pacienteSession } from "../middlewares/pacienteSession.js";
import { pacienteSessionSchema } from "../../schemas/pacienteSessionSchema.js";
import { PacientePortalService } from "../../services/paciente-portal.service.js";
import { PacienteConsultasService } from "../../services/paciente-consultas.service.js";

const router = Router();
const portalService = new PacientePortalService();
const consultasService = new PacienteConsultasService();

const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? "")}:${String(req.body?.cpf ?? "")}`,
});

router.post("/session", sessionLimiter, validate(pacienteSessionSchema), async (req, res, next) => {
  try {
    const { cpf, nascimento } = req.body;
    const { token } = await portalService.createSession({ cpf, nascimento });

    res.cookie("paciente_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("paciente_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  return res.status(200).json({ ok: true });
});

router.get("/consultas", pacienteSession, async (req, res, next) => {
  try {
    const patientId = req.paciente?.id;
    if (!patientId) {
      return res.status(401).json({ error: "Sessão inválida" });
    }
    const result = await consultasService.execute(patientId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

