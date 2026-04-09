import { Router } from "express";
import { AttendantController } from "../../modules/users/atendente.controller.js";

const userRouter = Router();
const ctrlAttend = new AttendantController()


userRouter.post("/registerP", ctrlAttend.registerPatient);
userRouter.post("/agendamento", ctrlAttend.registerAgenda);

export default userRouter;