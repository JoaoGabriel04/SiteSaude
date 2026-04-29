import { Request, Response } from "express";
import { MedicoService } from "../../services/MedicoService.js";
import MedicoRepository from "../../repositories/MedicoRepository.js";
import { AppError } from "../../errors/AppError.js";

const medicoService = new MedicoService(new MedicoRepository());

export class MedicoController {

  async cadastrarDisponibilidade(req: Request, res: Response) {
    try {
      const disponibilidade = await medicoService.cadastrarDisponibilidade(req.body);
      return res.status(201).json(disponibilidade);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async buscarDisponibilidade(req: Request, res: Response) {
    const docId = req.params.docId as string;

    try {
      const disponibilidade = await medicoService.buscarDisponibilidade(docId);
      return res.json(disponibilidade);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async deletarDisponibilidade(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      await medicoService.deletarDisponibilidade(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async buscarSlotsDisponiveis(req: Request, res: Response) {
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
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  /* === Exceções === */

  async cadastrarExcecao(req: Request, res: Response) {
    try {
      const { docId, data, motivo } = req.body;
      const excecao = await medicoService.cadastrarExcecao({
        docId,
        data: new Date(data),
        motivo
      });
      return res.status(201).json(excecao);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async buscarExcecoes(req: Request, res: Response) {
    const docId = req.params.docId as string;

    try {
      const excecoes = await medicoService.buscarExcecoes(docId);
      return res.json(excecoes);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async deletarExcecao(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      await medicoService.deletarExcecao(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}