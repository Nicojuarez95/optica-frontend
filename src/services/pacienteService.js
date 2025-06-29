import { apiClient } from './api'; // Asegúrate de que api.js exista en src/services/

const getPacientes = async () => {
  try {
    const response = await apiClient.get('/pacientes');
    console.log("SERVICE getPacientesCount - response.data:", response.data); // <--- LOG AQUÍ
    if (response.data && response.data.success) {
      return response.data.pacientes;
    } else {
      console.error("Respuesta del backend no tiene 'count' o 'success' es false:", response.data);
      throw new Error(response.data.message || 'Error al obtener pacientes desde el servicio');
    }
  } catch (error) {
    // El interceptor de apiClient ya debería haber formateado el error.message
    // Si no, error.response.data.message o error.message
    throw new Error(error.message || 'Error de red o servidor al obtener pacientes');
  }
};

const getPacientesCount = async () => {
  try {
    const response = await apiClient.get('/pacientes'); // Llama al mismo endpoint que getPacientes
    console.log("SERVICE getPacientesCount - response.data:", response.data); // <--- LOG IMPORTANTE
    if (response.data && response.data.success && response.data.count !== undefined) {
      return response.data.count; // Devuelve solo el conteo
    } else {
      console.error("SERVICE getPacientesCount: Respuesta del backend no tiene 'count' o 'success' es false:", response.data);
      throw new Error(response.data?.message || 'Error al obtener el conteo de pacientes');
    }
  } catch (error) {
    console.error("SERVICE getPacientesCount - Error en la llamada:", error);
    throw new Error(error.response?.data?.message || error.message || 'Error de red o servidor al obtener el conteo de pacientes');
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

const deletePrescripcionPaciente = async (pacienteId, prescripcionId) => {
    try {
        console.log("SERVICE: deletePrescripcionPaciente - pacienteId:", pacienteId, "prescripcionId:", prescripcionId);
        const response = await apiClient.delete(`/pacientes/${pacienteId}/prescripciones/${prescripcionId}`);
        if (response.data && response.data.success) {
            // Devuelve los IDs para facilitar la actualización en Redux
            return { pacienteId, prescripcionId }; 
        } else {
            throw new Error(response.data.message || 'Error al eliminar la prescripción desde el servicio');
        }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Error de red o servidor al eliminar la prescripción');
    }
};

const pacienteService = {
    getPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente,
    addPrescripcion,
    getPacientesCount,
    deletePrescripcionPaciente, // <-- AÑADE LA NUEVA FUNCIÓN
};

export default pacienteService;