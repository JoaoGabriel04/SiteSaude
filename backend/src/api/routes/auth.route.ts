import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller.js";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/registerU", controller.registerUser)
authRouter.post("/loginU", controller.loginCredentials)
authRouter.post("/refresh", controller.refreshToken)
authRouter.post("/logout", controller.logout)

export default authRouter;