import Joi from "joi";

export const registerService = Joi.object({

        horario_atend: Joi.date().iso().required()

    })
