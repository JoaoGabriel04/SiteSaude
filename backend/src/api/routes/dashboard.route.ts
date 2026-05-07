import { Router } from "express";
import { DashboardController } from "../../modules/users/dashboard.controller.js";
import { authToken } from "../middlewares/authenticate.js";

const router = Router();
const controller = new DashboardController();

router.get("/stats", authToken, controller.stats);

export default router;