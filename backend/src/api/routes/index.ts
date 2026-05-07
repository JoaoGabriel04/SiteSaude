import { Request, Response, Router } from "express";
import authRouter from "./auth.route.js";
import atendenteRouter from "./atendente.route.js";
import userRouter from "./user.route.js";
import medicoRouter from "./medico.route.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/edge.js";
import uploadRouter from "./upload.route.js";
import agendaRouter from "./agenda.route.js";
import dashboardRouter from "./dashboard.route.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/atendente", authToken, atendenteRouter);
apiRouter.use("/dashboard", authToken, dashboardRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/medico", authToken, authorize(Role.ATENDENTE, Role.ADMIN), medicoRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/agenda", agendaRouter);

apiRouter.get("/test", (req: Request, res: Response) => {
  res.send("Hello World!")
})

export default apiRouter;