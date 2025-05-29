interface ITodo {
    id: string;
    userId: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    description: string;
}

export type { ITodo };
