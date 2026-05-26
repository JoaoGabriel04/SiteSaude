import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@medflowgra.uk";

if (!process.env.RESEND_API_KEY) {
  console.warn("[Email] AVISO: RESEND_API_KEY não configurada!");
}

export async function enviarEmail(destinatario: string, assunto: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: destinatario,
      subject: assunto,
      html,
    });

    console.log("[Email] Enviado com sucesso:", data.data?.id);
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("[Email] Erro ao enviar:", error);
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