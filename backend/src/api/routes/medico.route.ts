import { Router } from "express";
import { MedicoController } from "../../modules/users/medico.controller.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const medicoRouter = Router();
const ctrlMedico = new MedicoController();

medicoRouter.get("/slots/:docId", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarSlotsDisponiveis);
medicoRouter.get("/disponibilidade/:docId", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.buscarDisponibilidade);
medicoRouter.get("/excecao/:docId", ctrlMedico.buscarExcecoes);
medicoRouter.get("/solicitacoes", ctrlMedico.buscarSolicitacoesPendentes);
medicoRouter.get("/solicitacoes/:id", ctrlMedico.buscarSolicitacaoById);
medicoRouter.get("/minhas-solicitacoes/:docId", ctrlMedico.buscarMinhasSolicitacoes);

medicoRouter.post("/disponibilidade", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.cadastrarDisponibilidade);
medicoRouter.post("/excecao", ctrlMedico.cadastrarExcecao);
medicoRouter.post("/excecao/periodo", ctrlMedico.cadastrarExcecaoPeriodo);

medicoRouter.put("/solicitacoes/:id/aprovar", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.aprobarSolicitacao);
medicoRouter.put("/solicitacoes/:id/negar", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.negarSolicitacao);

medicoRouter.delete("/disponibilidade/:id", authorize(Role.ATENDENTE, Role.ADMIN), ctrlMedico.deletarDisponibilidade);
medicoRouter.delete("/excecao/:id", ctrlMedico.deletarExcecao);

export default medicoRouter;