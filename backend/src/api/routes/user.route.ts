import { Router } from "express";
import { UserController } from "../../modules/users/user.controller.js";
import { authToken } from "../middlewares/authenticate.js";

const userRouter = Router();
const controller = new UserController();

userRouter.get("/", authToken, controller.getAll);
userRouter.get("/me", authToken, controller.getProfile);
userRouter.get("/search/profissionais", authToken, controller.getProfissionais);
userRouter.get("/search/pacientes", authToken, controller.getPacient);
userRouter.put("/profile", authToken, controller.updateProfile);

export default userRouter;