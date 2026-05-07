export type StatusVisual =
  | "AGENDADO"
  | "FINALIZADO"
  | "CANCELADO"
  | "ATRASADO";

export function getStatusVisual(
  status: string,
  horarioAtend: string | Date
): StatusVisual {
  // Status finais não mudam
  if (status === "FINALIZADO" || status === "CANCELADO") {
    return status;
  }

  // Se AGENDADO e já passou → ATRASADO
  const agora = new Date();
  const horario = new Date(horarioAtend);

  if (status === "AGENDADO" && horario < agora) {
    return "ATRASADO";
  }

  return "AGENDADO";
}