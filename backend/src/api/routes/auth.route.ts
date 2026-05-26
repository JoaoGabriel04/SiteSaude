import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerUser } from "../../schemas/registerUserSchema.js";
import { loginUser } from "../../schemas/loginUserSchema.js";

import rateLimit from "express-rate-limit";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const authRouter = Router();
const controller = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // só 5 tentativas em 15min
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
  skipSuccessfulRequests: true, // só conta as que falham
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/registerU", authToken, registerLimiter, validate(registerUser), authorize(Role.ADMIN), controller.registerUser)
authRouter.post("/loginU", loginLimiter, validate(loginUser), controller.loginCredentials)
authRouter.post("/refresh", refreshLimiter, controller.refreshToken)
authRouter.post("/logout", controller.logout)

export default authRouter;