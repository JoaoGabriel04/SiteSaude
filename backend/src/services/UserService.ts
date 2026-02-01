import UserRepository from "../repositories/UserRepository.js";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}