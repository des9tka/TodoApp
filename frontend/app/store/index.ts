// store/index.ts
import { create } from "zustand";
import { authService } from "../services/authService";
import { todoService } from "../services/todoService";
import { userService } from "../services/userService";
import { ITodo } from "../types/todoTypes";

interface TodoState {
    todos: ITodo[];
    isLoading: boolean;
    error: string | null;
    updatingTodos: Set<string>;
    fetchTodos: () => Promise<void>;
    createTodo: (todo: ITodo) => Promise<void>;
    updateTodo: (id: string, todo: ITodo) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
}

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (user: { email: string; password: string }) => Promise<void>;
    register: (user: {
        email: string;
        username: string;
        password: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
}

interface UserState {
    user: { id: string; email: string; username?: string } | null;
    isLoading: boolean;
    error: string | null;
    fetchUser: (userId: string) => Promise<void>;
    updateUser: (userId: string, username: string) => Promise<void>;
}

// В store добавьте флаг для предотвращения множественных обновлений
export const useTodoStore = create<TodoState>((set, get) => ({
    todos: [],
    isLoading: false,
    error: null,
    updatingTodos: new Set(),

    fetchTodos: async () => {
        set({ isLoading: true, error: null });
        try {
            const todos = await todoService.getAllTodos();
            set({ todos, isLoading: false });
        } catch (error) {
            set({ error: "Failed to fetch todos", isLoading: false });
        }
    },

    createTodo: async (todo) => {
        set({ isLoading: true, error: null });
        try {
            const newTodo = await todoService.createTodo(todo);
            set((state) => ({
                todos: [...state.todos, newTodo],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: "Failed to create todo", isLoading: false });
        }
    },

    updateTodo: async (id, todo) => {
        const state = get();

        if (state.updatingTodos?.has(id)) {
            console.log("Todo is already being updated, skipping");
            return;
        }

        const existingTodo = state.todos.find(
            (t) => t.id === id || t.id.toString() === id.toString(),
        );
        if (existingTodo && existingTodo.status === todo.status) {
            console.log("Status unchanged, skipping update");
            return;
        }

        set((state) => ({
            updatingTodos: new Set([
                ...Array.from(state.updatingTodos || []),
                id,
            ]),
            error: null,
        }));

        try {
            console.log("Updating todo on server:", { id, todo });
            const updatedTodo = await todoService.updateTodo(id, todo);

            set((state) => {
                const newUpdatingTodos = new Set(state.updatingTodos);
                newUpdatingTodos.delete(id);

                return {
                    todos: state.todos.map((t) =>
                        t.id === id || t.id.toString() === id.toString()
                            ? updatedTodo
                            : t,
                    ),
                    updatingTodos: newUpdatingTodos,
                    isLoading: false,
                };
            });

            console.log("Todo updated successfully");
        } catch (error) {
            console.error("Failed to update todo:", error);
            set((state) => {
                const newUpdatingTodos = new Set(state.updatingTodos);
                newUpdatingTodos.delete(id);

                return {
                    updatingTodos: newUpdatingTodos,
                    error: "Failed to update todo",
                    isLoading: false,
                };
            });
        }
    },

    deleteTodo: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await todoService.deleteTodo(id);
            set((state) => ({
                todos: state.todos.filter((t) => t.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: "Failed to delete todo", isLoading: false });
        }
    },
}));

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    login: async (user) => {
        try {
            const { accessToken, refreshToken } = await authService.loginUser(
                user,
            );
            set({ isAuthenticated: true, accessToken, refreshToken });
        } catch (error) {
            throw new Error("Login failed");
        }
    },
    register: async (user) => {
        try {
            const { accessToken, refreshToken } = await authService.createUser(
                user,
            );
            set({ isAuthenticated: true, accessToken, refreshToken });
        } catch (error) {
            throw new Error("Registration failed");
        }
    },
    logout: async () => {
        try {
            await authService.logoutUser();
            set({
                isAuthenticated: false,
                accessToken: null,
                refreshToken: null,
            });
        } catch (error) {
            throw new Error("Logout failed");
        }
    },
}));

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    fetchUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const user = await userService.getUser(userId);
            set({ user, isLoading: false });
        } catch (error) {
            set({ error: "Failed to fetch user", isLoading: false });
        }
    },
    updateUser: async (userId, username) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await userService.updateUser(userId, username);
            set({ user: updatedUser, isLoading: false });
        } catch (error) {
            set({ error: "Failed to update user", isLoading: false });
        }
    },
}));
