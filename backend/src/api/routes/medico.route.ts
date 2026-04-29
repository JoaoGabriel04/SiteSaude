import { Router } from "express";
import { MedicoController } from "../../modules/users/medico.controller.js";

const medicoRouter = Router();
const ctrlMedico = new MedicoController();

medicoRouter.get("/slots/:docId", ctrlMedico.buscarSlotsDisponiveis);
medicoRouter.get("/disponibilidade/:docId", ctrlMedico.buscarDisponibilidade);
medicoRouter.get("/excecao/:docId", ctrlMedico.buscarExcecoes);

medicoRouter.post("/disponibilidade", ctrlMedico.cadastrarDisponibilidade);
medicoRouter.post("/excecao", ctrlMedico.cadastrarExcecao);

medicoRouter.delete("/disponibilidade/:id", ctrlMedico.deletarDisponibilidade);
medicoRouter.delete("/excecao/:id", ctrlMedico.deletarExcecao);

export default medicoRouter;