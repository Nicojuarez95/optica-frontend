import axios from 'axios';
// Para evitar dependencias circulares directas con el store en este archivo base,
// es mejor obtener el token de localStorage aquí si es posible,
// o asegurar que la importación del store no cause problemas.
// La forma más segura es leer de localStorage en el interceptor.

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token desde localStorage para evitar dependencia directa del store aquí
    const token = localStorage.getItem('optisysToken'); // Asegúrate que la key 'optisysToken' sea la correcta
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
      // Esto requeriría una forma de acceder al store sin causar un ciclo,
      // o manejar la redirección de otra manera (ej. un evento).
      // import { store } from '../store/store'; // Cuidado con esta importación aquí
      // import { logout } from '../store/slices/authSlice';
      // store.dispatch(logout());
      // window.location.href = '/login'; // Redirección forzada como último recurso
      console.error("Error 401: No autorizado. El token puede ser inválido o haber expirado.");
    }
    // Extraer el mensaje de error del backend si está disponible
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    // Para que el rejectWithValue en los thunks reciba un mensaje más claro
    return Promise.reject(new Error(message));
  }
);


export { apiClient };    