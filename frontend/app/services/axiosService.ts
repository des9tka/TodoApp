import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

const ACCESS_TOKEN_EXPIRES_SECONDS = 12 * 60 * 60;
const REFRESH_TOKEN_EXPIRES_SECONDS = 24 * 60 * 60;

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

// Функция для обработки очереди запросов
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Функция для выхода из системы
const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    isRefreshing = false;
    failedQueue = [];

    processQueue(new Error("Authentication failed"), null);

    // Перенаправляем на страницу входа
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Проверяем, есть ли токен
        const accessToken = Cookies.get("accessToken");
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axiosInstance(originalRequest);
                        }
                        return Promise.reject(error);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get("refreshToken");

            if (!refreshToken) {
                logout();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post<RefreshTokenResponse>(
                    "http://localhost:3001/auth/refresh",
                    { refreshToken },
                    {
                        withCredentials: true,
                        timeout: 10000, // 10 секунд таймаут
                    },
                );

                const { accessToken, refreshToken: newRefreshToken } =
                    response.data;

                Cookies.set("accessToken", accessToken, {
                    expires: ACCESS_TOKEN_EXPIRES_SECONDS / (24 * 60 * 60),
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });

                Cookies.set("refreshToken", newRefreshToken, {
                    expires: REFRESH_TOKEN_EXPIRES_SECONDS / (24 * 60 * 60),
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                isRefreshing = false;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                logout();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
