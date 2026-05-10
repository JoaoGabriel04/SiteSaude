import { NextFunction, Request, Response } from "express";
import NotificacaoRepository from "../../repositories/NotificacaoRepository.js";
import { NotificacaoService } from "../../services/NotificacaoService.js";

const notificacaoRepo = new NotificacaoRepository();
const notificacaoService = new NotificacaoService(notificacaoRepo);

export class NotificacaoController {

  async buscarNotificacoes(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      await notificacaoService.marcarComoLida(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async marcarTodasComoLidas(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      await notificacaoService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}