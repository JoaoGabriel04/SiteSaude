import Joi, { CustomHelpers } from "joi"
import { Role } from "../../../generated/prisma/index.js"
import { cpf } from "cpf-cnpj-validator"

export function regUserJoi(data: unknown) {
    const schema = Joi.object({

        nome: Joi.string().min(3).max(100).required(),

        cpf: Joi.string().required().custom(validationCPF)
            .messages({
                "any.invalid": "CPF Invalido"
            }),

        password: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/).required()
            .messages({ "string.pattern.base": "A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, número e caractere especial " }),

        nascimento: Joi.date().iso().required(),

        email: Joi.string().email().required(),

        role: Joi.string().required().valid(...Object.values(Role))
            .messages({
                "any.only": "Opção ínvalida para campo função",
                "any.required": "O campo role é obrigatório"
            }),

        fone: Joi.string().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).required(),

        crm: Joi.when("role", {
            is: Role.MEDICO,
            then: Joi.string().pattern(/^[A-Z]{2,3}[\/-]?[A-Z]{2}\s?\d{4,6}$/).required().messages({
                "string.empty": "CRM é obrigatório para médico",
                "string.pattern.base": "Formato inválido do CRM"
            }), otherwise: Joi.forbidden().messages({
                "any.unknown": "CRM só pode ser informado para médicos"
            })
        }),

        especialidade: Joi.when("role", {
            is: Role.MEDICO,
            then: Joi.string().min(4).required(),
            otherwise: Joi.forbidden().messages({
                "any.unknown": "Especialidade só pode ser informado para médicos"
            })
        }),

        setor: Joi.when("role", {
            is: Role.ATENDENTE,
            then: Joi.string().min(4).required(),
            otherwise: Joi.forbidden().messages({
                "any.unknown": "Setor só pode ser informado para atendentes"
            })
        })
    })

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    })
}

export function lgUserJoi(data: unknown) {

    const schema = Joi.object({
        email: Joi.string().email().required()
            .messages({
                "string.email": "Email inválido",
                "string.empty": "Email é obrigatório"
            }),
        password: Joi.string().min(8).required()
            .messages({
                "any.required": "Senha obrigatório",
                "string.empty": "Senha está faltando",
                "string.min": "Senha curta demais"
            })
    })

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    })

}

export function regPant(data: unknown) {

    const schema = Joi.object({

        nome: Joi.string().min(3).max(100).required(),

        cpf: Joi.string().required().custom(validationCPF)
            .messages({
                "any.invalid": "CPF inválido"
            }),

        cartaoSus: Joi.string().required().custom(validarCNS)
            .messages({
                "any.invalid": "Cartão do SUS inválido"
            }),

        nascimento: Joi.date().iso().required(),

        email: Joi.string().email(),

        fone: Joi.string().pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).required(),

    })

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    })

}

export function regAtend(data: unknown){

    const schema = Joi.object({
        
        horario_atend: Joi.date().iso().required()

    })

}

function validationCPF(values: string, helpers: CustomHelpers) {

    const cpfNormalized = values.replace(/\D/g, "")

    if (!cpf.isValid(cpfNormalized)) {
        return helpers.error("any.invalid")
    }
    return cpfNormalized

}

function validarCNS(values: string, helpers: CustomHelpers) {
    const cnsNormalized = values.replace(/\D/g, "")

    if (!/^[1-2]\d{10}00[0-1]\d$|^[7-9]\d{14}$/.test(cnsNormalized)) {
        return helpers.error("any.invalid")
    }

    let soma = 0
    for (let i = 0; i < cnsNormalized.length; i++) {
        soma += Number(cnsNormalized[i]) * (15 - i)
    }

    return cnsNormalized
}