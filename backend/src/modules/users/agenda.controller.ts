import { NextFunction, Request, Response } from "express";
import { AgendaService } from "../../services/AgendaService.js";
import AgendaRepository from "../../repositories/AgendaRepository.js";
import { StatusAtendimento } from "../../../generated/prisma/index.js";
import UserRepository from "../../repositories/UserRepository.js";

const agendaService = new AgendaService(new AgendaRepository(), new UserRepository());

export class AgendaController {
  async registerAgenda(req: Request, res: Response, next: NextFunction) {

    const userId = req.user!.id

    try {
      const agendaRegistered = await agendaService.registerAgenda({ ...req.body, createdById: userId })
      res.json(agendaRegistered)
    } catch (error) {
      next(error);
    }

  }

  async getAgendamentos(req: Request, res: Response, next: NextFunction) {
    const { busca, docId, status, statusUrgencia, data, page } = req.query as {
      busca?: string;
      docId?: string;
      status?: string;
      statusUrgencia?: string;
      data?: string;
      page?: string;
    };
  
    try {
      const agendamentos = await agendaService.getAgendamentos({
        busca,
        docId,
        status,
        statusUrgencia,
        data,
        page: page ? parseInt(page) : 1,
      });
      return res.json(agendamentos);
    } catch (error) {
      next(error);
    }
  }
  
  async listarMeusAgendamentos(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = req.user!.id;

      const {
        busca,
        periodo,
        status,
        page = "1",
        limit = "20",
      } = req.query as Record<string, string>;

      const result = await agendaService.listarMeusAgendamentos({
        docId,
        busca,
        periodo: periodo as any,
        status: status as StatusAtendimento | undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async finalizarAgendamento(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const docId = req.user!.id;

      const atualizado = await agendaService.marcarComoFinalizado(id, docId);
      return res.json(atualizado);
    } catch (error) {
      next(error);
    }
  }

  async cancelarAgendamento(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { cancelReason } = req.body as { cancelReason?: string };
      const docId = req.user!.id;
      const userId = req.user!.id;

      const atualizado = await agendaService.cancelarAgendamento(id, docId, userId, cancelReason);
      return res.json(atualizado);
    } catch (error) {
      next(error);
    }
  }

  async restaurarAgendamento(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const docId = req.user!.id;

      const restaurado = await agendaService.restaurarAgendamento(id, docId);
      return res.json(restaurado);
    } catch (error) {
      next(error);
    }
  }

  async deleteAgenda(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const excluido = await agendaService.excluirAgendamento(id);
      return res.json(excluido);
    } catch (error) {
      next(error);
    }
  }
}