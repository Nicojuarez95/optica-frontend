import axios from 'axios';
import { store } from '../store/store'; // Para acceder al token

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // Obtener token del estado de Redux
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de respuestas para manejar errores globales (ej. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Podrías despachar una acción de logout aquí si el token es inválido/expiró
      // import { logout } from '../store/slices/authSlice';
      // store.dispatch(logout());
      // O simplemente redirigir a login
      // window.location.href = '/login';
      console.error("Error 401: No autorizado. El token puede ser inválido o haber expirado.");
    }
    // Extraer el mensaje de error del backend si está disponible
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    // Para que el rejectWithValue en los thunks reciba un mensaje más claro
    return Promise.reject(new Error(message));
  }
);

export default apiClient;