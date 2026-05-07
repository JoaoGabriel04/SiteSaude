import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerUser } from "../../schemas/registerUserSchema.js";
import { loginUser } from "../../schemas/loginUserSchema.js";
import rateLimit from "express-rate-limit";
const authRouter = Router();
const controller = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // só 5 tentativas em 15min
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
  skipSuccessfulRequests: true, // só conta as que falham
});

authRouter.post("/registerU", validate(registerUser), controller.registerUser)
authRouter.post("/loginU", loginLimiter, validate(loginUser), controller.loginCredentials)
authRouter.post("/refresh", controller.refreshToken)
authRouter.post("/logout", controller.logout)

export default authRouter;