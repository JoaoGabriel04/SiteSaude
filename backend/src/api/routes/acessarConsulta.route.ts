import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { PacientePortalService } from '../../services/paciente-portal.service.js';
import { acessarConsultaSchema } from '../../schemas/AcessarConsultaSchema.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
const portalService = new PacientePortalService();

const acessarConsultaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? "")}:${String(req.body?.cpf ?? "")}`,
});

router.post('/acessar-consultas',
    acessarConsultaLimiter,
    validate(acessarConsultaSchema),
    async (req, res, next) => {
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
    }
);

export default router;