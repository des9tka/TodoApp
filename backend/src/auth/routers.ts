import { RequestHandler, Router } from "express";
import { CreateUserController, LoginUserController, RefreshTokenController } from "./controllers";

const authRouter = Router();

authRouter.post("/", CreateUserController as RequestHandler);
authRouter.post("/login", LoginUserController as RequestHandler);
authRouter.get("/refresh", RefreshTokenController as RequestHandler);

export default authRouter;
