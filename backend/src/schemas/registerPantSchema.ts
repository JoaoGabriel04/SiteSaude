import Joi from "joi"
import { validationCPF, validarCNS } from "../utils/validaCpfCns.js"

export const registerPatient = Joi.object({

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
