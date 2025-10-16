import axios from "axios";

// VITE_API_BASE_URL should be the full API base, e.g. http://localhost:5000/api/v1
// If not provided, default to "/api/v1" for same-origin deployments
const apiBase = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

export const axiosInstance = axios.create({
    baseURL: apiBase,
    withCredentials: true,
});
