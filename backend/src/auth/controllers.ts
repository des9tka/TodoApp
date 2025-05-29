import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

import { db } from "src/config/db";
import { users } from "src/config/schema";
import { jwtService } from "src/services/jwtService";
import { bodyRequestHandler } from "src/utils/DataCheck";

const CreateUserController = async (req: Request, res: Response) => {
    bodyRequestHandler(req, res);

    const { username, email, password } = req?.body;

    if (!username || !email || !password)
        return res
            .status(400)
            .json({ error: "Email, password и username required." });

    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();

    if (user.length > 0)
        return res.status(409).json({ error: "User already exists." });

    const hashedPassword = bcrypt.hashSync(password.toString(), 10);

    await db
        .insert(users)
        .values({
            username,
            email,
            password: hashedPassword,
        })
        .returning()
        .execute();

    res.sendStatus(201);
};

const LoginUserController = async (req: Request, res: Response) => {
    bodyRequestHandler(req, res);

    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password required." });

    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();

    if (user.length === 0)
        return res.status(404).json({ error: "User not found." });

    const isPasswordValid = bcrypt.compareSync(
        password.toString(),
        user[0].password,
    );

    if (!isPasswordValid)
        return res.status(401).json({ error: "Email or password incorrect." });

    const { accessToken, refreshToken } = await jwtService.generateTokens(
        user[0].id.toString(),
    );

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
    });

    res.sendStatus(200);
};

const RefreshTokenController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not found." });
    }

    const tokens = await jwtService.refreshTokens(refreshToken);
    if (!tokens) {
        return res.status(401).json({ error: "Expired refresh token." });
    }

    res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: "strict",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        sameSite: "strict",
    });

    res.sendStatus(200);
};

export { CreateUserController, LoginUserController, RefreshTokenController };
