// Conecta el frontend con el backend.
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // URL/Puerto que utiliza BACKEND
});

// Todas las peticiones a la API usan el token una vez que el usuario ha iniciado sesión.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;