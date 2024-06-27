import axios from "axios";
import { apiUrl } from "../configs";

const API_BASE_URL = apiUrl;

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
