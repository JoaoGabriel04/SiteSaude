import { Router, Request, Response } from "express";
import { upload } from "../../lib/multer.js";
import { UploadService } from "../../services/UploadService.js";
import { authToken } from "../middlewares/authenticate.js";
import { AppError } from "../../errors/AppError.js";

const uploadRouter = Router();
const uploadService = new UploadService();

uploadRouter.post("/avatar", authToken, upload.single("avatar"), async (req: Request, res: Response) => {
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

export default uploadRouter;