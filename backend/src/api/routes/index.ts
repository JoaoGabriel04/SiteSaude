import { Request, Response, Router } from "express";
import authRouter from "./auth.route.js";
import atendenteRouter from "./atendente.route.js";
import userRouter from "./user.route.js";
import medicoRouter from "./medico.route.js";
import { authToken } from "../middlewares/authenticate.js";
import uploadRouter from "./upload.route.js";
import agendaRouter from "./agenda.route.js";
import dashboardRouter from "./dashboard.route.js";
import notificacaoRouter from "./notificacao.route.js";
import acessarConsultaRouter from "./acessarConsulta.route.js";
import pacienteRouter from "./paciente.route.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/atendente", authToken, atendenteRouter);
apiRouter.use("/dashboard", authToken, dashboardRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/medico", authToken, medicoRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/agenda", agendaRouter);
apiRouter.use("/notificacoes", authToken, notificacaoRouter);
apiRouter.use("/paciente", pacienteRouter);
apiRouter.use("/", acessarConsultaRouter);

apiRouter.get("/test", (req: Request, res: Response) => {
  res.send("Hello World!")
})

export default apiRouter;