import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../../services/dashboard.service.js";
import { Role } from "../../../generated/prisma/index.js";

const service = new DashboardService();

export class DashboardController {
  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role as Role;
      const data = await service.getStats(userId, role);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}