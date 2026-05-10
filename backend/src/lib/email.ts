import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmail(destinatario: string, assunto: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Medflow - Sistema de Saúde" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html,
    });

    console.log("Email enviado: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}

export async function enviarEmailSolicitacaoAprovada(
  emailMedico: string,
  nomeMedico: string,
  tipo: string,
  dataInicio: string,
  dataFim: string
) {
  const assunto = "✅ Sua solicitação de ausência foi aprovada";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Solicitação Aprovada</h2>
      <p>Olá <strong>${nomeMedico}</strong>,</p>
      <p>Sua solicitação de <strong>${tipo}</strong> foi <strong>aprovada</strong>.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Período:</strong> ${dataInicio} até ${dataFim}</p>
      </div>
      <p>Você pode verificar os detalhes na plataforma Medflow.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
        Este é um email automático do sistema Medflow. Não responda este email.
      </p>
    </div>
  `;

  return enviarEmail(emailMedico, assunto, html);
}

export async function enviarEmailSolicitacaoNegada(
  emailMedico: string,
  nomeMedico: string,
  tipo: string,
  dataInicio: string,
  dataFim: string,
  observacao: string
) {
  const assunto = "❌ Sua solicitação de ausência foi negada";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Solicitação Negada</h2>
      <p>Olá <strong>${nomeMedico}</strong>,</p>
      <p>Sua solicitação de <strong>${tipo}</strong> foi <strong>negada</strong>.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Período solicitado:</strong> ${dataInicio} até ${dataFim}</p>
        <p><strong>Motivo da negação:</strong> ${observacao || "Não especificado"}</p>
      </div>
      <p>Se houver dúvidas, entre em contato com a recepção.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
        Este é um email automático do sistema Medflow. Não responda este email.
      </p>
    </div>
  `;

  return enviarEmail(emailMedico, assunto, html);
}