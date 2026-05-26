import { Router } from "express";
import { UserController } from "../../modules/users/user.controller.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const userRouter = Router();
const controller = new UserController();

userRouter.get("/me", authToken, controller.getProfile);

userRouter.get("/", authToken, authorize(Role.ADMIN), controller.getAll);
userRouter.get("/search/profissionais", authToken, authorize(Role.ADMIN, Role.ATENDENTE), controller.getProfissionais);
userRouter.get("/search/pacientes", authToken, authorize(Role.ADMIN, Role.ATENDENTE), controller.getPacient);
userRouter.put("/profile", authToken, controller.updateProfile);

export default userRouter;