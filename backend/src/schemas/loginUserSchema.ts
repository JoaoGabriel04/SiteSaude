import Joi from "joi";

export const loginUser = Joi.object({
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