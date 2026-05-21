import { Router } from 'express';
import { AcessarConsultaService } from '../../services/AcessarConsultaService.js';
import { acessarConsultaSchema } from '../../schemas/AcessarConsultaSchema.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
const service = new AcessarConsultaService();

router.post('/acessar-consultas',
    validate(acessarConsultaSchema),
    async (req, res, next) => {
        try {
            const result = await service.execute(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;