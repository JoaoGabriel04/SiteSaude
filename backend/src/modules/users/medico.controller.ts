import { NextFunction, Request, Response } from "express";
import { MedicoService } from "../../services/MedicoService.js";
import MedicoRepository from "../../repositories/MedicoRepository.js";
import { AppError } from "../../errors/AppError.js";
import AgendaRepository from "../../repositories/AgendaRepository.js";

const medicoService = new MedicoService(new MedicoRepository(), new AgendaRepository());

export class MedicoController {

  async cadastrarDisponibilidade(req: Request, res: Response, next: NextFunction) {
    try {
      const disponibilidade = await medicoService.cadastrarDisponibilidade(req.body);
      return res.status(201).json(disponibilidade);
    } catch (error) {
      next(error);
    }
  }

  async buscarDisponibilidade(req: Request, res: Response, next: NextFunction) {
    const docId = req.params.docId as string;

    try {
      const disponibilidade = await medicoService.buscarDisponibilidade(docId);
      return res.json(disponibilidade);
    } catch (error) {
      next(error);
    }
  }

  async deletarDisponibilidade(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;

    try {
      await medicoService.deletarDisponibilidade(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async buscarSlotsDisponiveis(req: Request, res: Response, next: NextFunction) {
    const docId = req.params.docId as string;
    const { data } = req.query as { data: string };

    if (!data) {
      return res.status(400).json({ error: "Data é obrigatória" });
    }

    // Força parse como horário local em vez de UTC
    const [ano, mes, dia] = data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);

    try {
      const slots = await medicoService.buscarSlotsDisponiveis(docId, dataLocal);
      return res.json(slots);
    } catch (error) {
      next(error);
    }
  }

  /* === Exceções === */

  async cadastrarExcecao(req: Request, res: Response, next: NextFunction) {
    try {
      const { docId, data, motivo } = req.body;
      const excecao = await medicoService.cadastrarExcecao({
        docId,
        data: new Date(data),
        motivo
      });
      return res.status(201).json(excecao);
    } catch (error) {
      next(error);
    }
  }

  async buscarExcecoes(req: Request, res: Response, next: NextFunction) {
    const docId = req.params.docId as string;

    try {
      const excecoes = await medicoService.buscarExcecoes(docId);
      return res.json(excecoes);
    } catch (error) {
      next(error);
    }
  }

  async deletarExcecao(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;

    try {
      await medicoService.deletarExcecao(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}