import cookieParser from "cookie-parser";
import cors from "cors"; // Импортируем cors
import express, { NextFunction, Request, Response } from "express";

import authRouter from "./auth/routers";
import { connectDb } from "./config/db";
import todosRouter from "./todos/routers";
import userRouter from "./users/routers";

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/todos", todosRouter);
app.use("/users", userRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something happened!");
});

async function main() {
    try {
        await connectDb();
        app.listen(3001, () => {
            console.log("Connected to Server.");
        });
    } catch {
        process.exit(1);
    }
}

main();
