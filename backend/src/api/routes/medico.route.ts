import { Router } from "express";
import { MedicoController } from "../../modules/users/medico.controller.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const medicoRouter = Router();
const ctrlMedico = new MedicoController();

medicoRouter.get("/slots/:docId", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarSlotsDisponiveis);
medicoRouter.get("/disponibilidade/:docId", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarDisponibilidade);
medicoRouter.get("/excecao/:docId", authorize(Role.MEDICO, Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarExcecoes);
medicoRouter.get("/solicitacoes", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarSolicitacoesPendentes);
medicoRouter.get("/solicitacoes/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarSolicitacaoById);
medicoRouter.get("/minhas-solicitacoes/:docId", authorize(Role.MEDICO, Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarMinhasSolicitacoes);

medicoRouter.post("/disponibilidade", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.cadastrarDisponibilidade);
medicoRouter.post("/excecao", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.cadastrarExcecao);
medicoRouter.post("/excecao/periodo", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.cadastrarExcecaoPeriodo);

medicoRouter.put("/solicitacoes/:id/aprovar", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.aprobarSolicitacao);
medicoRouter.put("/solicitacoes/:id/negar", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.negarSolicitacao);

medicoRouter.delete("/disponibilidade/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.deletarDisponibilidade);
medicoRouter.delete("/excecao/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.deletarExcecao);

export default medicoRouter;