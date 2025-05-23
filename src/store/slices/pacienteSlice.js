import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pacienteService from '../../services/pacienteService';

const initialState = {
  pacientes: [],
  pacienteSeleccionado: null,
  isLoading: false,
  error: null,
  totalPacientes: 0,
  isLoadingTotalPacientes: false, // Estado de carga específico
  errorTotalPacientes: null, 
};

// --- NUEVO: Thunk para obtener el total de pacientes para el dashboard ---
export const fetchTotalPacientesDashboard = createAsyncThunk(
  'pacientes/fetchTotalPacientesDashboard',
  async (_, { rejectWithValue }) => { // No necesita parámetros de entrada
    try {
      // Llama a la nueva función de servicio getPacientesCount
      const count = await pacienteService.getPacientesCount(); 
      return count; // Esperamos que esto sea el número del conteo
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunks Asíncronos - Asegúrate de que todos estos estén exportados
export const fetchPacientes = createAsyncThunk(
  'pacientes/fetchPacientes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await pacienteService.getPacientes();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPacienteById = createAsyncThunk(
  'pacientes/fetchPacienteById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await pacienteService.getPacienteById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewPaciente = createAsyncThunk(
  'pacientes/addNewPaciente',
  async (pacienteData, { rejectWithValue }) => {
    try {
      const data = await pacienteService.createPaciente(pacienteData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingPaciente = createAsyncThunk(
  'pacientes/updateExistingPaciente',
  async ({ id, pacienteData }, { rejectWithValue }) => {
    try {
      const data = await pacienteService.updatePaciente(id, pacienteData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingPaciente = createAsyncThunk(
  'pacientes/deleteExistingPaciente',
  async (id, { rejectWithValue }) => {
    try {
      // El servicio deletePaciente devuelve el ID si tiene éxito
      await pacienteService.deletePaciente(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewPrescripcion = createAsyncThunk(
  'pacientes/addNewPrescripcion',
  async ({ pacienteId, prescripcionData }, { rejectWithValue }) => {
    try {
      const data = await pacienteService.addPrescripcion(pacienteId, prescripcionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePrescripcionHistorial = createAsyncThunk(
    'pacientes/deletePrescripcionHistorial',
    async ({ pacienteId, prescripcionId }, { rejectWithValue }) => {
        try {
            console.log("SLICE: deletePrescripcionHistorial - pacienteId:", pacienteId, "prescripcionId:", prescripcionId); // <--- VERIFICA ESTE LOG
            const data = await pacienteService.deletePrescripcionPaciente(pacienteId, prescripcionId);
            return data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const pacienteSlice = createSlice({
  name: 'pacientes',
  initialState,
  reducers: {
    seleccionarPaciente: (state, action) => { state.pacienteSeleccionado = action.payload; },
    limpiarPacienteSeleccionado: (state) => { state.pacienteSeleccionado = null; },
    clearPacientesError: (state) => {
      state.error = null;
      state.errorTotalPacientes = null; // Limpiar también el error del dashboard
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pacientes
      .addCase(fetchPacientes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePrescripcionHistorial.pending, (state) => {
                state.isLoading = true; // O un isLoadingDeletePrescripcion específico
                state.error = null;
            })
            .addCase(deletePrescripcionHistorial.fulfilled, (state, action) => {
                state.isLoading = false;
                const { pacienteId, prescripcionId } = action.payload;

                // Actualizar el paciente en la lista de pacientes (si es necesario)
                const pacienteIndex = state.pacientes.findIndex(p => p._id === pacienteId);
                if (pacienteIndex !== -1) {
                    state.pacientes[pacienteIndex].historialPrescripciones = 
                        state.pacientes[pacienteIndex].historialPrescripciones.filter(presc => presc._id !== prescripcionId);
                }

                // Actualizar el pacienteSeleccionado si es el mismo
                if (state.pacienteSeleccionado && state.pacienteSeleccionado._id === pacienteId) {
                    state.pacienteSeleccionado.historialPrescripciones = 
                        state.pacienteSeleccionado.historialPrescripciones.filter(presc => presc._id !== prescripcionId);
                }
            })
            .addCase(deletePrescripcionHistorial.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
      .addCase(fetchTotalPacientesDashboard.fulfilled, (state, action) => {
        state.isLoadingTotalPacientes = false;
        state.totalPacientes = action.payload;
      })
      .addCase(fetchPacientes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pacientes = action.payload;
      })
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Paciente By ID
      .addCase(fetchPacienteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPacienteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pacienteSeleccionado = action.payload;
      })
      .addCase(fetchPacienteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add New Paciente
      .addCase(addNewPaciente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewPaciente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pacientes.push(action.payload);
        state.pacientes.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
      })
      .addCase(addNewPaciente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Paciente
      .addCase(updateExistingPaciente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingPaciente.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pacientes.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.pacientes[index] = action.payload;
        }
        if (state.pacienteSeleccionado && state.pacienteSeleccionado._id === action.payload._id) {
            state.pacienteSeleccionado = action.payload;
        }
      })
      .addCase(updateExistingPaciente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Paciente
      .addCase(deleteExistingPaciente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingPaciente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pacientes = state.pacientes.filter(p => p._id !== action.payload);
        if (state.pacienteSeleccionado && state.pacienteSeleccionado._id === action.payload) {
            state.pacienteSeleccionado = null;
        }
      })
      .addCase(deleteExistingPaciente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Prescripcion
      .addCase(addNewPrescripcion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewPrescripcion.fulfilled, (state, action) => {
        state.isLoading = false;
        const pacienteActualizado = action.payload;
        const index = state.pacientes.findIndex(p => p._id === pacienteActualizado._id);
        if (index !== -1) {
          state.pacientes[index] = pacienteActualizado;
        }
        if (state.pacienteSeleccionado && state.pacienteSeleccionado._id === pacienteActualizado._id) {
            state.pacienteSeleccionado = pacienteActualizado;
        }
      })
      .addCase(addNewPrescripcion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
      
  },
});

// Exportar las actions síncronas generadas por createSlice
export const { seleccionarPaciente, limpiarPacienteSeleccionado, clearPacientesError } = pacienteSlice.actions;
export default pacienteSlice.reducer;