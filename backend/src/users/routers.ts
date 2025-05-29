import { RequestHandler, Router } from "express";
import { loginMiddleware } from "src/middlewares.ts";
import { getUserController, updateUserController } from "./controllers";

const userRouter = Router();

userRouter.get(
    "/",
    loginMiddleware as RequestHandler,
    getUserController as RequestHandler,
);

userRouter.patch(
    "/",
    loginMiddleware as RequestHandler,
    updateUserController as RequestHandler,
);

export default userRouter;
