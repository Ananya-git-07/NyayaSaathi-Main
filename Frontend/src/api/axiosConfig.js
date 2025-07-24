import axios from 'axios';

const baseURL = '/api'; // Always relative
const apiClient = axios.create({ baseURL, withCredentials: true });

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error) => { failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve()); failedQueue = []; };

export const setupInterceptors = (logoutCallback) => {
    apiClient.interceptors.response.use( (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then(() => apiClient(originalRequest));
                }
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    await apiClient.post('/auth/refresh-token');
                    processQueue(null);
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError);
                    logoutCallback();
                    return Promise.reject(refreshError);
                } finally { isRefreshing = false; }
            }
            return Promise.reject(error.response?.data || error);
        }
    );
};

export default apiClient;