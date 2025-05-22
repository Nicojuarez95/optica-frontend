import { apiClient } from './api'; // Asegúrate de que api.js exista en src/services/

const getPacientes = async () => {
  try {
    const response = await apiClient.get('/pacientes');
    // El backend devuelve { success: true, count: X, pacientes: [...] }
    if (response.data && response.data.success) {
      return response.data.pacientes;
    } else {
      // Si success es false o no viene, lanzar error con el mensaje del backend
      throw new Error(response.data.message || 'Error al obtener pacientes desde el servicio');
    }
  } catch (error) {
    // El interceptor de apiClient ya debería haber formateado el error.message
    // Si no, error.response.data.message o error.message
    throw new Error(error.message || 'Error de red o servidor al obtener pacientes');
  }
};

const getPacienteById = async (id) => {
  try {
    const response = await apiClient.get(`/pacientes/${id}`);
    if (response.data && response.data.success) {
      return response.data.paciente;
    } else {
      throw new Error(response.data.message || 'Error al obtener el paciente desde el servicio');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al obtener el paciente');
  }
};

const createPaciente = async (pacienteData) => {
  try {
    const response = await apiClient.post('/pacientes', pacienteData);
    if (response.data && response.data.success) {
      return response.data.paciente;
    } else {
      throw new Error(response.data.message || 'Error al crear el paciente desde el servicio');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al crear el paciente');
  }
};

const updatePaciente = async (id, pacienteData) => {
  try {
    const response = await apiClient.put(`/pacientes/${id}`, pacienteData);
    if (response.data && response.data.success) {
      return response.data.paciente;
    } else {
      throw new Error(response.data.message || 'Error al actualizar el paciente desde el servicio');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al actualizar el paciente');
  }
};

const deletePaciente = async (id) => {
  try {
    const response = await apiClient.delete(`/pacientes/${id}`);
    if (response.data && response.data.success) {
      return id; // Devolver el ID para facilitar la actualización en el estado de Redux
    } else {
      throw new Error(response.data.message || 'Error al eliminar el paciente desde el servicio');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al eliminar el paciente');
  }
};

const addPrescripcion = async (pacienteId, prescripcionData) => {
  try {
    const response = await apiClient.post(`/pacientes/${pacienteId}/prescripciones`, prescripcionData);
    if (response.data && response.data.success) {
      return response.data.paciente; // Devuelve el paciente actualizado con la nueva prescripción
    } else {
      throw new Error(response.data.message || 'Error al agregar prescripción desde el servicio');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al agregar prescripción');
  }
};

const pacienteService = {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
  addPrescripcion,
};

export default pacienteService;
