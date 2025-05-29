import {
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    varchar,
} from "drizzle-orm/pg-core";

export const todoStatusEnum = pgEnum("todo_status", [
    "todo",
    "in_progress",
    "done",
]);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 100 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
});

export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: todoStatusEnum("status").notNull().default("todo"),
});
