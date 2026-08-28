import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_API_URL
            : "/api",

    withCredentials: true,
});

export default api;