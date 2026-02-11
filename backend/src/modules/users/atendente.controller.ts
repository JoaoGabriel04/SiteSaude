import { Request, Response } from "express"
import { UserService } from "../../services/UserService.js"
import UserRepository from "../../repositories/UserRepository.js"
import { Role } from "../../../generated/prisma/index.js";

const userService = new UserService(new UserRepository());

export class AttendantController {


    async registerPatient(req: Request, res: Response) {

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const role = req.user?.role
        if (role !== Role.ATENDENTE && role !== Role.ADMIN) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        try {

            const patientRegistered = await userService.registerPatient(req.body)

            res.json(patientRegistered)

        } catch (error) {
            res.status(500).json({ error: (error as Error).message })
        }
    }

    async registerAgenda(req: Request, res: Response) {

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const { role } = req.user

        if (role !== Role.ATENDENTE && role !== Role.ADMIN) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        try {

            const agendaRegistered = await userService.registerAgenda({ ...req.body, createdById: req.user.id })
            
            res.json(agendaRegistered)

        } catch (error) {

            return res.status(500).json({ error: (error as Error).message })

        }

    }
}


