import NotificacaoRepository from "../repositories/NotificacaoRepository.js";
import { enviarEmailSolicitacaoAprovada, enviarEmailSolicitacaoNegada } from "../lib/email.js";

export class NotificacaoService {
  constructor(private notificacaoRepo: NotificacaoRepository) {}

  async criarNotificacao(userId: string, titulo: string, mensagem: string, tipo: string) {
    return this.notificacaoRepo.createNotificacao({ userId, titulo, mensagem, tipo });
  }

  async notificarSolicitacaoAprovada(
    userId: string,
    email: string,
    nomeMedico: string,
    tipo: string,
    dataInicio: string,
    dataFim: string
  ) {
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
  ) {
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

  async getNotificacoes(userId: string) {
    return this.notificacaoRepo.findByUserId(userId);
  }

  async countNaoLidas(userId: string) {
    return this.notificacaoRepo.countNaoLidas(userId);
  }

  async marcarComoLida(id: string) {
    return this.notificacaoRepo.marcarComoLida(id);
  }

  async marcarTodasComoLidas(userId: string) {
    return this.notificacaoRepo.marcarTodasComoLidas(userId);
  }

  async delete(id: string) {
    return this.notificacaoRepo.delete(id);
  }

  async deleteOldRead(userId: string) {
    return this.notificacaoRepo.deleteOldRead(userId);
  }
}