import { Request, Response, Router } from "express";
import authRouter from "./auth.route.js";
import atendenteRouter from "./atendente.route.js";
import userRouter from "./user.route.js";
import medicoRouter from "./medico.route.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/edge.js";
import uploadRouter from "./upload.route.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/atendente", authToken, authorize(Role.ATENDENTE, Role.ADMIN), atendenteRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/medico", authToken, authorize(Role.ATENDENTE, Role.ADMIN), medicoRouter);
apiRouter.use("/upload", uploadRouter);

apiRouter.get("/test", (req: Request, res: Response) => {
  res.send("Hello World!")
})

export default apiRouter;