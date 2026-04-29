import { Request, Response } from "express"
import { UserService } from "../../services/UserService.js"
import UserRepository from "../../repositories/UserRepository.js"
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

  async updatePatient(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      const patientUpdated = await userService.updatePatient(id, req.body);
      return res.json(patientUpdated);
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error); // adiciona isso
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async deletePatient(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      await userService.deletePatient(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async registerAgenda(req: Request, res: Response) {

    const userId = req.user!.id

    try {
      const agendaRegistered = await userService.registerAgenda({ ...req.body, createdById: userId })
      res.json(agendaRegistered)
    } catch (error) {
      console.log("Erro ao criar agenda:", error)
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message })
      }
      return res.status(500).json({ error: "Erro interno do servidor" })
    }

  }

  async getAgendamentos(req: Request, res: Response) {
    const { busca, docId, status, statusUrgencia, data, page } = req.query as {
      busca?: string;
      docId?: string;
      status?: string;
      statusUrgencia?: string;
      data?: string;
      page?: string;
    };
  
    try {
      const agendamentos = await userService.getAgendamentos({
        busca,
        docId,
        status,
        statusUrgencia,
        data,
        page: page ? parseInt(page) : 1,
      });
      return res.json(agendamentos);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  
}


