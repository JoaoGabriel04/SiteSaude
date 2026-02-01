import { Router } from "express";
import authRouter from "./auth.route.js";
import atendenteRouter from "./atedente.route.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/atendente", atendenteRouter);

export default apiRouter;