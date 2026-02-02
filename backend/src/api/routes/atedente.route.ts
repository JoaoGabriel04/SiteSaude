import { Router } from "express";
import {authToken} from "../../api/middlewares/authenticate.js";
import { registerPant } from "../../modules/users/atendente.controller.js"
import UserRepository from "../../repositories/UserRepository.js";
import { UserService } from "../../services/UserService.js";
import { UserController } from "../../modules/users/user.controller.js";

const userRoute = Router();
const controller = new UserController();

userRoute.get("/profile", authToken, controller.getProfile);

userRoute.post("/registerP", authToken, registerPant)

export default userRoute;