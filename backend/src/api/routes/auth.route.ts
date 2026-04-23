import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerUser } from "../../schemas/registerUserSchema.js";
import { loginUser } from "../../schemas/loginUserSchema.js";
const authRouter = Router();
const controller = new AuthController();

authRouter.post("/registerU", validate(registerUser), controller.registerUser)
authRouter.post("/loginU", validate(loginUser), controller.loginCredentials)
authRouter.post("/refresh", controller.refreshToken)
authRouter.post("/logout", controller.logout)

export default authRouter;