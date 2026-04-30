import { Router } from "express";
import { AttendantController } from "../../modules/users/atendente.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerPatient } from "../../schemas/registerPantSchema.js";

const atendenteRouter = Router();
const ctrlAttend = new AttendantController()

atendenteRouter.get("/agendamentos", ctrlAttend.getAgendamentos);

atendenteRouter.post("/registerP", validate(registerPatient), ctrlAttend.registerPatient);
atendenteRouter.post("/agendamento", ctrlAttend.registerAgenda);

atendenteRouter.patch("/paciente/:id", ctrlAttend.updatePatient);
atendenteRouter.patch("/profissional/:id", ctrlAttend.updateUser);

atendenteRouter.delete("/paciente/:id", ctrlAttend.deletePatient);
atendenteRouter.delete("/profissional/:id", ctrlAttend.deleteUser);

export default atendenteRouter