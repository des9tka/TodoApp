import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";

import authRouter from "./auth/routes";
import todosRouter from "./todos/routers";
import { connectDb } from "./config/db";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/todos", todosRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something happened!");
});

async function main() {
    try {
        await connectDb();
        app.listen(3000, () => {
            console.log("Server has starter.");
        });
    } catch {
        process.exit(1);
    }
}

main();
