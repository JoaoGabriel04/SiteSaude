import { Request, Response } from "express";
import UserRepository from "../../repositories/UserRepository.js";
import { UserService } from "../../services/UserService.js";

const userService = new UserService(new UserRepository());

export class UserController {

  async getProfile(req: Request, res: Response) {

    const { userId } = req.params as { userId: string };

    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }

  }
}