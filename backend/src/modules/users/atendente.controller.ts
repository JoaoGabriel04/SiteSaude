import { Request, Response } from "express"
import { UserService } from "../../services/UserService.js"
import UserRepository from "../../repositories/UserRepository.js"
import { Role } from "../../../generated/prisma/index.js";
import { AppError } from "../../errors/AppError.js";

const userService = new UserService(new UserRepository());

export class AttendantController {

    async registerPatient(req: Request, res: Response) {
        try {
            const patientRegistered = await userService.registerPatient(req.body)
            res.json(patientRegistered)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message })
            }
            return res.status(500).json({ error: "Erro interno do servidor" })
        }
    }

    async registerAgenda(req: Request, res: Response) {
        
        const userId = req.user!.id

        try {
            const agendaRegistered = await userService.registerAgenda({ ...req.body, createdById: userId })
            res.json(agendaRegistered)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message })
            }
            return res.status(500).json({ error: "Erro interno do servidor" })
        }

    }
}


