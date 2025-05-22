import { apiClient } from './api'; // Asegúrate que api.js exporte apiClient nombradamente

const getInventario = async (filtros = {}) => {
  try {
    const response = await apiClient.get('/inventario', { params: filtros });
    if (response.data && response.data.success) {
      return response.data.items; // El backend devuelve 'items'
    } else {
      throw new Error(response.data.message || 'Error al obtener el inventario');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al obtener el inventario');
  }
};

const getItemInventarioById = async (id) => {
  try {
    const response = await apiClient.get(`/inventario/${id}`);
    if (response.data && response.data.success) {
      return response.data.item;
    } else {
      throw new Error(response.data.message || 'Error al obtener el item del inventario');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al obtener el item del inventario');
  }
};

const createItemInventario = async (itemData) => {
  try {
    const response = await apiClient.post('/inventario', itemData);
    if (response.data && response.data.success) {
      return response.data.item;
    } else {
      throw new Error(response.data.message || 'Error al crear el item de inventario');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al crear el item de inventario');
  }
};

const updateItemInventario = async (id, itemData) => {
  try {
    const response = await apiClient.put(`/inventario/${id}`, itemData);
    if (response.data && response.data.success) {
      return response.data.item;
    } else {
      throw new Error(response.data.message || 'Error al actualizar el item de inventario');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al actualizar el item de inventario');
  }
};

const deleteItemInventario = async (id) => {
  try {
    const response = await apiClient.delete(`/inventario/${id}`);
    if (response.data && response.data.success) {
      return id; // Devolver el ID para facilitar la actualización en el estado de Redux
    } else {
      throw new Error(response.data.message || 'Error al eliminar el item de inventario');
    }
  } catch (error) {
    throw new Error(error.message || 'Error de red o servidor al eliminar el item de inventario');
  }
};

const inventarioService = {
  getInventario,
  getItemInventarioById,
  createItemInventario,
  updateItemInventario,
  deleteItemInventario,
};

export default inventarioService;