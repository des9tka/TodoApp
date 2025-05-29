import axiosInstance from "./axiosService";

import { ITodo } from "../types/todoTypes";

const getAllTodos = async (): Promise<ITodo[]> => {
    const response = await axiosInstance.get("/todos");
    return response.data;
};

const createTodo = async (todo: ITodo): Promise<ITodo> => {
    const response = await axiosInstance.post("/todos", todo);
    return response.data;
};

const updateTodo = async (id: string, todo: ITodo): Promise<ITodo> => {
    const response = await axiosInstance.patch(`/todos/${id}`, todo);
    return response.data;
};

const deleteTodo = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/todos/${id}`);
};

export const todoService = {
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
};
