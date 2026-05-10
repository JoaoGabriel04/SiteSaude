import { Router } from "express";
import { NotificacaoController } from "../../modules/users/notificacao.controller.js";

const notificacaoRouter = Router();
const ctrlNotificacao = new NotificacaoController();

notificacaoRouter.get("/", ctrlNotificacao.buscarNotificacoes);

notificacaoRouter.put("/:id/lida", ctrlNotificacao.marcarComoLida);
notificacaoRouter.put("/marcar-todas-lidas", ctrlNotificacao.marcarTodasComoLidas);
notificacaoRouter.delete("/:id", ctrlNotificacao.deletar);

export default notificacaoRouter;