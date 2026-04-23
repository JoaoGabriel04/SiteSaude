import Joi from "joi"
import { Role } from "../../generated/prisma/index.js"
import { validationCPF } from "../utils/validaCpfCns.js"

export const registerUser = Joi.object({

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