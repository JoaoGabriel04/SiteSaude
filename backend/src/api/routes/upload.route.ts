import { Router, Request, Response } from "express";
import { upload } from "../../lib/multer.js";
import { UploadService } from "../../services/upload.service.js";
import { authToken } from "../middlewares/authenticate.js";
import { AppError } from "../../errors/AppError.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/index.js";

const uploadRouter = Router();
const uploadService = new UploadService();

uploadRouter.post("/avatar", authToken, upload.single("avatar"), authorize(Role.ADMIN, Role.ATENDENTE, Role.MEDICO), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new AppError("Nenhuma imagem enviada", 400);
    }

    const url = await uploadService.uploadAvatar(req.file);
    return res.json({ url });
  } catch (error) {
    console.error("Erro no upload:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

uploadRouter.delete("/avatar", authToken, authorize(Role.ADMIN, Role.ATENDENTE), async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      throw new AppError("URL da imagem é obrigatória", 400);
    }

    await uploadService.deleteAvatar(url);
    return res.json({ message: "Imagem removida com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar avatar:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default uploadRouter;