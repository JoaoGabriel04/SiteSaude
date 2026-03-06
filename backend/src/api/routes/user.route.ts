import { Router } from "express";
import { UserController } from "../../modules/users/user.controller.js";

const userRouter = Router();
const controller = new UserController();

userRouter.get("/", controller.getAll)

export default userRouter;