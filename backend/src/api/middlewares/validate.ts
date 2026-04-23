import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error){
            return res.status(400).json({
                error: error.details.map((err) => err.message)
            });
        }
        req.body = value;

        return next();
    }
}