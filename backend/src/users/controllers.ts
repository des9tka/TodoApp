import { eq } from "drizzle-orm";
import { Request, Response } from "express";

import { db } from "src/config/db";
import { users } from "src/config/schema";
import { bodyRequestHandler } from "src/utils/dataCheck";

const getUserController = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = Number(req.user.userId);
    const user = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .execute();

    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user[0]);
};

const updateUserController = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    bodyRequestHandler(req, res);

    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

    const userId = Number(req.user.userId);
    await db
        .update(users)
        .set({ username })
        .where(eq(users.id, userId))
        .returning();

    res.sendStatus(200);
};

export { getUserController, updateUserController };
