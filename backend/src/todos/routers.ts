import { RequestHandler, Router } from "express";
import { loginMiddleware } from "src/middlewares.ts";
import { TestController } from "./controllers";

const todosRouter = Router();

todosRouter.get(
    "/",
    loginMiddleware as RequestHandler,
    TestController as RequestHandler,
);

export default todosRouter;
