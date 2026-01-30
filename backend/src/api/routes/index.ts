import { Router } from "express";
import { AuthController } from "../../modules/users/user.controller.js";
import authToken from "../../modules/auth/auth.controller.js";

const router = Router();
const controller = new AuthController();

router.post("/registerU", controller.registerUser)
router.post("/loginU", controller.loginCredentials)

export default router;