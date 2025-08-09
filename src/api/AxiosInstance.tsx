import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_ADDRESS
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        const excludedEndpoints = [
            '/login',
            '/register'
        ];

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/refresh') &&
            !excludedEndpoints.some(endpoint => originalRequest.url.includes(endpoint))
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['x-auth-token'] = token;
                    return axiosInstance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available.');

                const response = await axios.post(
                    `${import.meta.env.VITE_SERVER_ADDRESS}/api/users/refresh-token`,
                    { refreshToken }
                );

                const newToken = response.data.accessToken;
                localStorage.setItem('authToken', newToken);

                axiosInstance.defaults.headers.common['x-auth-token'] = newToken;
                processQueue(null, newToken);

                originalRequest.headers['x-auth-token'] = newToken;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token invalid or expired.");
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                processQueue(refreshError, null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
