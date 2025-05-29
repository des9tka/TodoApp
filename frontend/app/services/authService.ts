import Cookies from "js-cookie";
import axiosInstance from "./axiosService";

const createUser = async (user: { email: string; password: string }) => {
    const response = await axiosInstance.post("/auth", user);
    return response.data;
};

const loginUser = async (user: { email: string; password: string }) => {
    const response = await axiosInstance.post("/auth/login", user);
    return response.data;
};

const logoutUser = async () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    window.location.href = "/auth/login";
};

export const authService = {
    createUser,
    loginUser,
    logoutUser,
};
