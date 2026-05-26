import NotificacaoRepository from "../repositories/notificacao.repository.js";
import { enviarEmailSolicitacaoAprovada, enviarEmailSolicitacaoNegada } from "../lib/email.js";
import { emitirNotificacao } from "../lib/socket.js";
import type { Notificacao } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";

type BatchResult = { count: number };

export class NotificacaoService {
  constructor(private notificacaoRepo: NotificacaoRepository) {}

  async criarNotificacao(userId: string, titulo: string, mensagem: string, tipo: string): Promise<Notificacao> {
    const notificacao = await this.notificacaoRepo.createNotificacao({ userId, titulo, mensagem, tipo });
    emitirNotificacao(userId, notificacao);
    return notificacao;
  }

  async notificarSolicitacaoAprovada(
    userId: string,
    email: string,
    nomeMedico: string,
    tipo: string,
    dataInicio: string,
    dataFim: string
  ): Promise<void> {
    await Promise.all([
      this.criarNotificacao(
        userId,
        "Solicitação Aprovada",
        `Sua solicitação de ${tipo} para o período ${dataInicio} até ${dataFim} foi aprovada.`,
        "SOLICITACAO_APROVADA"
      ),
      enviarEmailSolicitacaoAprovada(email, nomeMedico, tipo, dataInicio, dataFim)
    ]);
  }

  async notificarSolicitacaoNegada(
    userId: string,
    email: string,
    nomeMedico: string,
    tipo: string,
    dataInicio: string,
    dataFim: string,
    observacao: string
  ): Promise<void> {
    await Promise.all([
      this.criarNotificacao(
        userId,
        "Solicitação Negada",
        `Sua solicitação de ${tipo} foi negada. Motivo: ${observacao}`,
        "SOLICITACAO_NEGADA"
      ),
      enviarEmailSolicitacaoNegada(email, nomeMedico, tipo, dataInicio, dataFim, observacao)
    ]);
  }

  async getNotificacoes(userId: string): Promise<Notificacao[]> {
    return this.notificacaoRepo.findByUserId(userId);
  }

  async countNaoLidas(userId: string): Promise<number> {
    return this.notificacaoRepo.countNaoLidas(userId);
  }

  async marcarComoLida(id: string, userId: string): Promise<void> {
    const result = await this.notificacaoRepo.marcarComoLida(id, userId);
    if (!result.count) {
      throw new AppError("Notificação não encontrada", 404);
    }
  }

  async marcarTodasComoLidas(userId: string): Promise<BatchResult> {
    return this.notificacaoRepo.marcarTodasComoLidas(userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificacaoRepo.delete(id, userId);
    if (!result.count) {
      throw new AppError("Notificação não encontrada", 404);
    }
  }

  async deleteOldRead(userId: string): Promise<BatchResult> {
    return this.notificacaoRepo.deleteOldRead(userId);
  }
}