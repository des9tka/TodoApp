import { and, eq, like } from "drizzle-orm";
import { Request, Response } from "express";

import { db } from "src/config/db";
import { todos, todoStatusEnum } from "src/config/schema";
import { bodyRequestHandler } from "src/utils/dataCheck";

const validStatuses = todoStatusEnum.enumValues;

const GetAllUsersTodosController = async (
    req: Request,
    res: Response,
): Promise<Response | void> => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { status, title, description } = req.query;

    const conditions = [eq(todos.userId, Number(req.user.userId))];

    if (typeof status === "string") {
        if (
            !validStatuses.includes(
                status as (typeof todoStatusEnum.enumValues)[number],
            )
        ) {
            return res.status(400).json({
                error: `Invalid status. Valid statuses: ${validStatuses.join(
                    ", ",
                )}.`,
            });
        }
        conditions.push(
            eq(
                todos.status,
                status as (typeof todoStatusEnum.enumValues)[number],
            ),
        );
    }

    if (typeof title === "string" && title.trim()) {
        conditions.push(like(todos.title, `%${title.trim()}%`));
    }

    if (typeof description === "string" && description.trim()) {
        conditions.push(like(todos.description, `%${description.trim()}%`));
    }

    const usersTodos = await db
        .select()
        .from(todos)
        .where(and(...conditions))
        .execute();

    res.status(200).json(usersTodos);
};

const CreateTodoController = async (
    req: Request,
    res: Response,
): Promise<Response | void> => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    bodyRequestHandler(req, res);
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
        return res
            .status(400)
            .json({ error: "Title, description and status are required." });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: `Invalid status. Valid statuses: ${validStatuses.join(
                ", ",
            )}.`,
        });
    }

    const newTodo = await db
        .insert(todos)
        .values({
            userId: Number(req.user.userId),
            title,
            description,
            status,
        })
        .returning()
        .execute();

    res.status(201).json(newTodo[0]);
};

const UpdateTodoStatusController = async (
    req: Request,
    res: Response,
): Promise<Response | void> => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    bodyRequestHandler(req, res);

    const todoId = Number(req.params.todoId);

    if (!todoId) {
        return res.status(400).json({ error: "Missing todoId" });
    }

    const { status, description, title } = req.body;

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: `Invalid status. Valid statuses: ${validStatuses.join(
                ", ",
            )}.`,
        });
    }

    const updateData: Partial<{
        status: (typeof todoStatusEnum.enumValues)[number];
        description: string;
        title: string;
    }> = {};

    if (status) updateData.status = status;
    if (description) updateData.description = description;
    if (title) updateData.title = title;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    const returnTodo = await db
        .update(todos)
        .set(updateData)
        .where(
            eq(todos.id, todoId) && eq(todos.userId, Number(req.user.userId)),
        )
        .returning();

    if (returnTodo.length === 0)
        return res.status(404).json({ error: "Todo not found or forbidden." });

    res.status(200).json(returnTodo[0]);
};

const DeleteTodoController = async (
    req: Request,
    res: Response,
): Promise<Response | void> => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const todoId = Number(req.params.todoId);
    if (!todoId) {
        return res.status(400).json({ error: "Missing todoId" });
    }

    const todo = await db
        .select()
        .from(todos)
        .where(eq(todos.id, todoId))
        .execute();

    if (todo.length === 0) {
        return res.status(404).json({ error: "Todo not found" });
    } else if (todo[0].userId !== Number(req.user.userId)) {
        return res.status(403).json({ error: "Forbidden to delete." });
    }

    await db.delete(todos).where(eq(todos.id, todoId)).execute();

    res.status(204).send();
};

export {
    CreateTodoController,
    DeleteTodoController,
    GetAllUsersTodosController,
    UpdateTodoStatusController,
};
