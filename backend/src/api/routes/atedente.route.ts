import { Router } from "express";
import { AttendantController } from "../../modules/users/atendente.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerPatient } from "../../schemas/registerPantSchema.js";

const userRouter = Router();
const ctrlAttend = new AttendantController()

userRouter.post("/registerP", validate(registerPatient), ctrlAttend.registerPatient);
userRouter.post("/agendamento", ctrlAttend.registerAgenda);

export default userRouter;