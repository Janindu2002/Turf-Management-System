import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    withCredentials: true, // Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: attach token automatically later
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling authentication errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401, user is not authenticated
        if (error.response?.status === 401) {
            // Clear any stored token
            localStorage.removeItem("token");

            // Redirect to login page if NOT on a public route
            const publicRoutes = ['/', '/login', '/register'];
            const currentPath = window.location.pathname;

            if (!publicRoutes.includes(currentPath)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
