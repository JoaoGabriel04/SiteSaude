import Joi from 'joi';

export const acessarConsultaSchema = Joi.object({
    nomeCompleto: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Nome completo deve ter pelo menos 3 caracteres',
            'string.max': 'Nome completo é muito longo'
        }),

    cpf: Joi.string()
        .trim()
        .pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
        .required()
        .messages({
            'string.empty': 'CPF é obrigatório',
            'string.pattern.base': 'CPF inválido. Use o formato 000.000.000-00'
        })
});

export type AcessarConsultaInput = {
    nomeCompleto?: string;
    cpf: string;
};