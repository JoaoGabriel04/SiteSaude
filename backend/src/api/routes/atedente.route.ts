import { Router } from "express";
import authToken from "../../modules/auth/auth.controller.js";
import { registerPant } from "../../modules/users/atendente.controller.js"

const router = Router();

router.post("/registerP", authToken, registerPant)

export default router