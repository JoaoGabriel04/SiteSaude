import { prisma } from "../lib/prisma.js";

export default class NotificacaoRepository {

  async createNotificacao(data: {
    userId: string;
    titulo: string;
    mensagem: string;
    tipo: string;
  }) {
    return prisma.notificacao.create({ data });
  }

  async findByUserId(userId: string) {
    return prisma.notificacao.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async countNaoLidas(userId: string) {
    return prisma.notificacao.count({
      where: { userId, lida: false }
    });
  }

  async marcarComoLida(id: string) {
    return prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });
  }

  async marcarTodasComoLidas(userId: string) {
    return prisma.notificacao.updateMany({
      where: { userId, lida: false },
      data: { lida: true }
    });
  }

  async delete(id: string) {
    return prisma.notificacao.delete({
      where: { id }
    });
  }

  async deleteOldRead(userId: string) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return prisma.notificacao.deleteMany({
      where: {
        userId,
        lida: true,
        createdAt: { lt: oneDayAgo }
      }
    });
  }
}