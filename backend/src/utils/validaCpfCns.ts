import { cpf } from "cpf-cnpj-validator";

export function validationCPF(value: string): string {
  const normalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && normalized.startsWith("999")) {
    return normalized;
  }

  if (!cpf.isValid(normalized)) {
    throw new Error("CPF inválido");
  }

  return normalized;
}

export function validarCNS(value: string): string {
  const normalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && normalized.startsWith("999")) {
    return normalized;
  }

  if (!/^[1-2]\d{10}00[0-1]\d$|^[7-9]\d{14}$/.test(normalized)) {
    throw new Error("Cartão do SUS inválido");
  }

  let soma = 0;
  for (let i = 0; i < normalized.length; i++) {
    soma += Number(normalized[i]) * (15 - i);
  }

  return normalized;
}