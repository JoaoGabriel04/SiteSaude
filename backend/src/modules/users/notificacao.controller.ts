import { NextFunction, Request, Response } from "express";
import NotificacaoRepository from "../../repositories/notificacao.repository.js";
import { NotificacaoService } from "../../services/notificacao.service.js";

const notificacaoRepo = new NotificacaoRepository();
const notificacaoService = new NotificacaoService(notificacaoRepo);

export class NotificacaoController {

  async buscarNotificacoes(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;

    try {
      await notificacaoService.deleteOldRead(userId);
      const notificacoes = await notificacaoService.getNotificacoes(userId);
      const naoLidas = await notificacaoService.countNaoLidas(userId);
      return res.json({ notificacoes, naoLidas });
    } catch (error) {
      next(error);
    }
  }

  async marcarComoLida(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    try {
      const userId = req.user!.id;
      await notificacaoService.marcarComoLida(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async marcarTodasComoLidas(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;

    try {
      await notificacaoService.marcarTodasComoLidas(userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    try {
      const userId = req.user!.id;
      await notificacaoService.delete(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}