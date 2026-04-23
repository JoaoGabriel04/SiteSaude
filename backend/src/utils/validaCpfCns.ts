import { CustomHelpers } from "joi";
import { cpf } from "cpf-cnpj-validator";

export function validationCPF(values: string, helpers: CustomHelpers) {

    const cpfNormalized = values.replace(/\D/g, "")

    if (process.env.NODE_ENV !== "production" && cpfNormalized.startsWith("999")) {
        return cpfNormalized;
    }

    if (!cpf.isValid(cpfNormalized)) {
        return helpers.error("any.invalid")
    }
    return cpfNormalized

}

export function validarCNS(values: string, helpers: CustomHelpers) {
    const cnsNormalized = values.replace(/\D/g, "")

    if (process.env.NODE_ENV !== "production" && cnsNormalized.startsWith("999")) {
        return cnsNormalized;
    }

    if (!/^[1-2]\d{10}00[0-1]\d$|^[7-9]\d{14}$/.test(cnsNormalized)) {
        return helpers.error("any.invalid")
    }

    let soma = 0
    for (let i = 0; i < cnsNormalized.length; i++) {
        soma += Number(cnsNormalized[i]) * (15 - i)
    }

    return cnsNormalized
}