import { Request, Response, Router } from "express";
import authRouter from "./auth.route.js";
import atendenteRouter from "./atedente.route.js";
import userRouter from "./user.route.js";
import { authToken } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/RolesAuthorize.js";
import { Role } from "../../../generated/prisma/edge.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/atendente", authToken, authorize(Role.ATENDENTE, Role.ADMIN), atendenteRouter);
apiRouter.use("/user", userRouter);

// Rota teste
apiRouter.get("/test", (req: Request, res: Response)=>{
  res.send("Hello World!")
})

export default apiRouter;