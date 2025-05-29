import { RequestHandler, Router } from "express";
import { loginMiddleware } from "src/middlewares.ts";
import {
    CreateTodoController,
    DeleteTodoController,
    GetAllUsersTodosController,
    UpdateTodoStatusController,
} from "./controllers";

const todosRouter = Router();

todosRouter.get(
    "/",
    loginMiddleware as RequestHandler,
    GetAllUsersTodosController as RequestHandler,
);

todosRouter.post(
    "/",
    loginMiddleware as RequestHandler,
    CreateTodoController as RequestHandler,
);

todosRouter.patch(
    "/:todoId",
    loginMiddleware as RequestHandler,
    UpdateTodoStatusController as RequestHandler,
);

todosRouter.delete(
    "/:todoId",
    loginMiddleware as RequestHandler,
    DeleteTodoController as RequestHandler,
);

export default todosRouter;
