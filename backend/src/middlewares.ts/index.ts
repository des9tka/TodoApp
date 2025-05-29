import { NextFunction, Request, Response } from "express";
import { jwtService } from "src/services/jwtService";

const loginMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: "Access-токен не предоставлен." });
    }

    const decoded = await jwtService.verifyToken(accessToken);
    if (!decoded) {
        return res
            .status(401)
            .json({ error: "Недействительный access-токен." });
    }

    req.user = { userId: decoded.userId };

    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
        req.user = undefined;
        return originalSend(body);
    };

    next();
};

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string } | undefined;
        }
    }
}

export { loginMiddleware };
