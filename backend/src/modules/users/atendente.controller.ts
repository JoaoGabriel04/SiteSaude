import { NextFunction, Request, Response } from "express"
import { UserService } from "../../services/UserService.js"
import UserRepository from "../../repositories/UserRepository.js"
import AgendaRepository from "../../repositories/AgendaRepository.js";
import { AgendaService } from "../../services/AgendaService.js";

const userService = new UserService(new UserRepository());
const agendaService = new AgendaService(new AgendaRepository(), new UserRepository());

export class AttendantController {

  async registerPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientRegistered = await userService.registerPatient(req.body)
      res.json(patientRegistered)
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;

    try {
      const patientUpdated = await userService.updatePatient(id, req.body);
      return res.json(patientUpdated);
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;

    try {
      await userService.deletePatient(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
  
    try {
      const userUpdated = await userService.updateUser(id, req.body);
      return res.json(userUpdated);
    } catch (error) {
      next(error);
    }
  }
  
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;
  
    try {
      await userService.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
}


