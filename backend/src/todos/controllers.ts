import { Request, Response } from "express";

const TestController = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(req?.user.userId);
    res.status(200).json({ message: "Test successful" });
};

export { TestController };
