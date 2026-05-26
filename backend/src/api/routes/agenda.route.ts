import { Router } from "express";
import { AgendaController } from "../../modules/users/agenda.controller.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const agendaRouter = Router();
const agendaController = new AgendaController();

// Rotas exclusivas do médico logado
agendaRouter.get(
  "/meus",
  authToken,
  authorize(Role.MEDICO),
  agendaController.listarMeusAgendamentos
);
agendaRouter.get(
  "/agendamentos",
  authToken,
  authorize(Role.ATENDENTE, Role.ADMIN),
  agendaController.getAgendamentos
);

agendaRouter.post("/agendamento", authToken, authorize(Role.ATENDENTE, Role.ADMIN), agendaController.registerAgenda);

agendaRouter.patch(
  "/:id/finalizar",
  authToken,
  authorize(Role.MEDICO),
  agendaController.finalizarAgendamento
);

agendaRouter.patch(
  "/:id/cancelar",
  authToken,
  authorize(Role.ATENDENTE, Role.ADMIN),
  agendaController.cancelarAgendamento
);

agendaRouter.patch(
  "/:id/restaurar",
  authToken,
  authorize(Role.ATENDENTE, Role.ADMIN),
  agendaController.restaurarAgendamento
);

agendaRouter.delete(
  "/:id",
  authToken,
  authorize(Role.ATENDENTE, Role.ADMIN),
  agendaController.deleteAgenda
);

export default agendaRouter;