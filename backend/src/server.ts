import cookieParser from "cookie-parser";
import express from "express";

import userRouter from "./User/routes";
import { connectDb } from "./config/db";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/users", userRouter);

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
