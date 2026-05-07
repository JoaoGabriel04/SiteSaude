import { Router } from "express";
import { AttendantController } from "../../modules/users/atendente.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerPatient } from "../../schemas/registerPantSchema.js";
import { Role } from "../../../generated/prisma/index.js";
import { authorize } from "../middlewares/RolesAuthorize.js";

const atendenteRouter = Router();
const ctrlAttend = new AttendantController()

atendenteRouter.post("/registerP", validate(registerPatient), authorize(Role.ATENDENTE, Role.ADMIN), ctrlAttend.registerPatient);

atendenteRouter.patch("/paciente/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlAttend.updatePatient);
atendenteRouter.patch("/profissional/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlAttend.updateUser);

atendenteRouter.delete("/paciente/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlAttend.deletePatient);
atendenteRouter.delete("/profissional/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlAttend.deleteUser);

export default atendenteRouter