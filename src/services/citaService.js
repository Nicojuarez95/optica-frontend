import { apiClient } from './api'; // Asegúrate que api.js exporte apiClient nombradamente

const getCitas = async (filtros = {}) => {
  try {
    const response = await apiClient.get('/citas', { params: filtros });
    if (response.data && response.data.success) {
      return response.data.citas;
    } else {
      throw new Error(response.data.message || 'Error al obtener citas');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al obtener citas');
  }
};

const getCitaById = async (id) => {
  try {
    const response = await apiClient.get(`/citas/${id}`);
    if (response.data && response.data.success) {
      return response.data.cita;
    } else {
      throw new Error(response.data.message || 'Error al obtener la cita');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al obtener la cita');
  }
};

const createCita = async (citaData) => {
  try {
    const response = await apiClient.post('/citas', citaData);
    if (response.data && response.data.success) {
      return response.data.cita;
    } else {
      throw new Error(response.data.message || 'Error al crear la cita');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al crear la cita');
  }
};

const updateCita = async (id, citaData) => {
  try {
    const response = await apiClient.put(`/citas/${id}`, citaData);
    if (response.data && response.data.success) {
      return response.data.cita;
    } else {
      throw new Error(response.data.message || 'Error al actualizar la cita');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al actualizar la cita');
  }
};

const deleteCita = async (id) => {
  try {
    const response = await apiClient.delete(`/citas/${id}`);
    if (response.data && response.data.success) {
      return id; // Devolver el ID para facilitar la actualización en el estado de Redux
    } else {
      throw new Error(response.data.message || 'Error al eliminar la cita');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al eliminar la cita');
  }
};

const citaService = {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
};

export default citaService;