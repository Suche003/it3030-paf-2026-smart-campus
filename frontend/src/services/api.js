import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    const isAuthRequest =
      req.url?.includes("/auth/login") ||
      req.url?.includes("/auth/register");

    if (token && !isAuthRequest) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;