import axiosInstance from "./axiosService";

const getUser = async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
};

const updateUser = async (userId: string, username: string) => {
    const response = await axiosInstance.patch(`/users`, username);
    return response.data;
};

export const userService = {
    getUser,
    updateUser,
};
