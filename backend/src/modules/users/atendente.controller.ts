import { Request, Response } from "express"
import { regPant } from "../validate.js"
import { prisma } from "../../lib/prisma.js"
import { Role } from "../../../generated/prisma/index.js"

export async function registerPant(req: Request, res: Response) {

    if (req.user?.role === Role.ATENDENTE || req.user?.role == Role.ADMIN) {
        try {
            const { error, value } = regPant(req.body)
            if (error) {
                return res.status(400).json({ error: error.message })
            }

            const { nome, cpf, cartaoSus, nascimento, email, fone } = value

            const verifyCpf = await prisma.patient.findFirst({
                where: { cpf }
            })
            if (verifyCpf) {
                return res.status(400).json({ error: "CPF já cadastrado" })
            }

            const patientCreated = await prisma.patient.create({
                data: {
                    nome,
                    cpf,
                    cartaoSus,
                    nascimento,
                    email,
                    fone
                }
            })

            res.json({
                message: "Paciente criado com sucesso",
                patientCreated,
            })


        } catch (error) {
            return res.status(400).json({ error })
        }
    } else {
        return res.status(500).json({ error: "Acesso negado" })
    }
}

export async function registarAtendimento(req: Request, res: Response) {


    if (req.user?.role === Role.ADMIN || req.user?.role === Role.ATENDENTE) {

        try {

        } catch (error) {
            return res.status(500).json({ error: "Acesso negado" })
        }


    } else {
        return res.status(500).json({ error:"Acesso negado" })
    }

}


