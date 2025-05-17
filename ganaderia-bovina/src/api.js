// Conecta el frontend con el backend.
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // URL/Puerto que utiliza BACKEND
});
export default api;