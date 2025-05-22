import { apiClient } from './api';

const register = async (name, email, password) => {
  const response = await apiClient.post('/users/register', { name, email, password });
  // El backend devuelve { success: true, message: '...', token: '...', user: { id, name, email } }
  if (response.data && response.data.success) {
    return response.data; // Contiene token y user
  } else {
    throw new Error(response.data.message || 'Error en el registro desde el servicio');
  }
};

const login = async (email, password) => {
  const response = await apiClient.post('/users/sign-in', { email, password });
  if (response.data && response.data.success) {
    return response.data; // Contiene token y user
  } else {
    throw new Error(response.data.message || 'Error en el inicio de sesión desde el servicio');
  }
};

const getMe = async () => {
  // Esta ruta podría ser útil para verificar el token al cargar la app
  const response = await apiClient.get('/users/me');
  if (response.data && response.data.success) {
    return response.data.user;
  } else {
    throw new Error(response.data.message || 'Error al obtener datos del usuario');
  }
};

const authService = {
  register,
  login,
  getMe,
};

export default authService;