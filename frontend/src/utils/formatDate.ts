export function formatDataHora(dateStr: string): string {
  const d = new Date(dateStr);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  const hora = String(d.getUTCHours()).padStart(2, "0");
  const minuto = String(d.getUTCMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano}, ${hora}:${minuto}`;
}