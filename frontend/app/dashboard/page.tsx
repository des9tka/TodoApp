"use client";
import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import { useTodoStore } from "../store";
import { ITodo } from "../types/todoTypes";

function Dashboard() {
    const { todos, isLoading, error, fetchTodos, createTodo, updateTodo } =
        useTodoStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState({ title: "", description: "" });
    const todoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
        todo: null,
        in_progress: null,
        done: null,
    });

    const statuses = [
        {
            id: "todo",
            name: "TODO",
            color: "red",
            shadowColor: "shadow-red-500/20",
            borderColor: "border-red-500/50",
        },
        {
            id: "in_progress",
            name: "IN PROGRESS",
            color: "yellow",
            shadowColor: "shadow-yellow-500/20",
            borderColor: "border-yellow-500/50",
        },
        {
            id: "done",
            name: "DONE",
            color: "green",
            shadowColor: "shadow-green-500/20",
            borderColor: "border-green-500/50",
        },
    ];

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    useEffect(() => {
        const sortables: Sortable[] = [];
        statuses.forEach((status) => {
            if (todoRefs.current[status.id]) {
                sortables.push(
                    Sortable.create(todoRefs.current[status.id]!, {
                        group: "todos",
                        animation: 300,
                        ghostClass: "sortable-ghost",
                        chosenClass: "sortable-chosen",
                        dragClass: "sortable-drag",
                        onEnd: async (evt) => {
                            console.log("Drag ended:", evt);

                            const itemId = evt.item.dataset.id;
                            const newStatus = evt.to.dataset
                                .status as ITodo["status"];

                            console.log("Item ID:", itemId);
                            console.log("New Status:", newStatus);
                            console.log("Event target:", evt.to);
                            console.log("Event item:", evt.item);

                            if (itemId && newStatus) {
                                const todo = todos.find((t) => t.id === itemId);
                                console.log("Found todo:", todo);

                                if (todo) {
                                    console.log("Updating todo with:", {
                                        ...todo,
                                        status: newStatus,
                                    });

                                    try {
                                        await updateTodo(itemId, {
                                            ...todo,
                                            status: newStatus,
                                        });
                                        console.log(
                                            "Todo updated successfully",
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to update todo:",
                                            error,
                                        );
                                    }
                                } else {
                                    console.error(
                                        "Todo not found for ID:",
                                        itemId,
                                    );
                                }
                            } else {
                                console.error("Missing itemId or newStatus:", {
                                    itemId,
                                    newStatus,
                                });
                            }
                        },
                    }),
                );
            }
        });

        return () => sortables.forEach((sortable) => sortable.destroy());
    }, [todos, updateTodo]);

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.title.trim()) return;
        try {
            await createTodo({
                id: "",
                userId: "",
                title: newTodo.title,
                status: "todo",
                description: newTodo.description,
            });
            setNewTodo({ title: "", description: "" });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create todo:", err);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen text-white flex flex-col px-4 sm:px-6 md:px-8 lg:px-12 py-8">
            <div className="flex-grow bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        Dashboard
                    </h1>
                    <button
                        className="px-6 py-2 rounded-full text-lg font-semibold bg-sky-600 hover:bg-sky-700 transition shadow-md transform hover:scale-105"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Todo
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {statuses.map((status) => (
                        <div key={status.id} className="flex flex-col">
                            <h2
                                className={`text-2xl font-bold mb-4 text-${status.color}-500`}
                            >
                                {status.name}
                            </h2>
                            <div
                                ref={(el) => {
                                    todoRefs.current[status.id] = el;
                                }}
                                data-status={status.id}
                                className="min-h-[200px] bg-black/20 p-4 rounded-xl"
                            >
                                {todos
                                    .filter((todo) => todo.status === status.id)
                                    .map((todo) => (
                                        <div
                                            key={todo.id}
                                            data-id={todo.id}
                                            className={`${status.shadowColor} ${status.borderColor} bg-black/30 border-2 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-grab mb-4`}
                                        >
                                            <div
                                                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-${status.color}-500`}
                                            >
                                                {status.name}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-white">
                                                {todo.title}
                                            </h3>
                                            {todo.description && (
                                                <p className="text-white/90">
                                                    Description available
                                                </p>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-black mb-4">
                            Create New Todo
                        </h2>
                        <form onSubmit={handleCreateTodo}>
                            <div className="mb-4">
                                <label className="block text-black mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newTodo.title}
                                    onChange={(e) =>
                                        setNewTodo({
                                            ...newTodo,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-black"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-black mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newTodo.description}
                                    onChange={(e) =>
                                        setNewTodo({
                                            ...newTodo,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-black"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 text-white"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
