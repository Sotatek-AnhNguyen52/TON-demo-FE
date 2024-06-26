import axios from "axios";
import { apiUrl } from "../configs";

const API_BASE_URL = apiUrl;

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIxMTIzLCJ1c2VybmFtZSI6InZpcF9hY2NvdW50IiwicmVmZXJyYWxfY29kZSI6IjFkZjBlOGE1YTUxNDQ0NzBiMzIxYjJjNzZlYjNkMDlhIiwiaWF0IjoxNzE5Mzg4ODc2fQ.IkDcbbo2css3tqdo4atiAjxhxqYoEZ3D3MPGZs86h-g'
    },
});
