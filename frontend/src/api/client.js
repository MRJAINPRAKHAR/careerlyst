import axios from "axios";
import { getToken } from "../utils/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Axios automatically sets Content-Type to multipart/form-data + boundary when it sees a FormData instance.
  // Manually setting it here breaks the boundary and can cause the request to fail or headers to malform.
  return config;
});