import { Request, Response } from "express";

const bodyRequestHandler = (req: Request, res: Response): Response | void => {
    if (!req.body)
        return res.status(400).json({ error: "Request body is required." });
};

export { bodyRequestHandler };
