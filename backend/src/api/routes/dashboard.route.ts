import { Router } from "express";
import { DashboardController } from "../../modules/users/dashboard.controller.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const router = Router();
const controller = new DashboardController();

router.get("/stats", authToken, authorize(Role.ADMIN), controller.stats);

export default router;