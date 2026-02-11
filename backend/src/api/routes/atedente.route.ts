import { Router } from "express";
import {authToken} from "../../api/middlewares/authenticate.js";
import { UserController } from "../../modules/users/user.controller.js";
import { AttendantController } from "../../modules/users/atendente.controller.js";

const userRoute = Router();
const controller = new UserController();
const ctrlAttend = new AttendantController()

userRoute.get("/profile", authToken, controller.getProfile);

userRoute.post("/registerP", authToken, ctrlAttend.registerPatient);
userRoute.post("/agendamento", authToken, ctrlAttend.registerAgenda);

export default userRoute;