import { NextFunction, Request, Response } from "express";
import { MedicoService } from "../../services/medico.service.js";
import MedicoRepository from "../../repositories/medico.repository.js";
import { AppError } from "../../errors/AppError.js";
import AgendaRepository from "../../repositories/agenda.repository.js";
import NotificacaoRepository from "../../repositories/notificacao.repository.js";
import { NotificacaoService } from "../../services/notificacao.service.js";

const medicoService = new MedicoService(
  new MedicoRepository(), 
  new AgendaRepository(),
  new NotificacaoService(new NotificacaoRepository())
);

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
    const { data, patientId } = req.query as { data: string; patientId?: string };

    if (!data) {
      return res.status(400).json({ error: "Data é obrigatória" });
    }

    // Força parse como horário local em vez de UTC
    const [ano, mes, dia] = data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);

    try {
      const slots = await medicoService.buscarSlotsDisponiveis(docId, dataLocal, patientId);
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
    const userId = req.user?.id;

    try {
      await medicoService.deletarExcecao(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async cadastrarExcecaoPeriodo(req: Request, res: Response, next: NextFunction) {
    try {
      const { docId, dataInicio, dataFim, motivo } = req.body;
      const resultado = await medicoService.cadastrarExcecaoPeriodo({
        docId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        motivo
      });
      return res.status(201).json({ message: "Solicitação enviada com sucesso! Aguarde a aprovação.", count: resultado.count });
    } catch (error) {
      next(error);
    }
  }

  /* === Solicitações === */

  async buscarSolicitacoesPendentes(req: Request, res: Response, next: NextFunction) {
    try {
      const solicitacoes = await medicoService.buscarSolicitacoesPendentes();
      return res.json(solicitacoes);
    } catch (error) {
      next(error);
    }
  }

  async buscarSolicitacaoById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    try {
      const solicitacao = await medicoService.buscarSolicitacaoById(id);
      if (!solicitacao) {
        return res.status(404).json({ error: "Solicitação não encontrada" });
      }
      return res.json(solicitacao);
    } catch (error) {
      next(error);
    }
  }

  async buscarMinhasSolicitacoes(req: Request, res: Response, next: NextFunction) {
    const docId = req.params.docId as string;
    try {
      const solicitacoes = await medicoService.buscarMinhasSolicitacoes(docId);
      return res.json(solicitacoes);
    } catch (error) {
      next(error);
    }
  }

  async aprobarSolicitacao(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const aprovadoPorId = req.user!.id;
    try {
      const resultado = await medicoService.aprovarSolicitacao(id, aprovadoPorId);
      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async negarSolicitacao(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
    const aprovadoPorId = req.user!.id;
    const { observacao } = req.body;
    try {
      const resultado = await medicoService.negarSolicitacao(id, aprovadoPorId, observacao);
      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}