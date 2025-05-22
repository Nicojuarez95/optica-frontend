import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import citaService from '../../services/citaService';

const initialState = {
  citas: [],
  isLoading: false,
  error: null,
  citasDashboard: [], // Aquí guardaremos las citas para mostrar en el dashboard (ej. las de hoy)
  isLoadingDashboardCitas: false, // Estado de carga específico para el widget
  errorDashboardCitas: null, 
};

export const fetchCitasParaDashboard = createAsyncThunk(
  'citas/fetchCitasParaDashboard',
  async (filtrosDashboard = {}, { rejectWithValue }) => {
    // Ejemplo de filtrosDashboard: { fecha: 'YYYY-MM-DD' } para citas de un día específico
    // o { fechaDesde: 'YYYY-MM-DDTHH:mm', limite: 5 } para próximas N citas
    try {
      const data = await citaService.getCitas(filtrosDashboard);
      return data; // El servicio devuelve el array de citas que cumplen el filtro
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCitas = createAsyncThunk(
  'citas/fetchCitas',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const data = await citaService.getCitas(filtros);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewCita = createAsyncThunk(
  'citas/addNewCita',
  async (citaData, { rejectWithValue }) => {
    try {
      const data = await citaService.createCita(citaData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingCita = createAsyncThunk(
  'citas/updateExistingCita',
  async ({ id, citaData }, { rejectWithValue }) => {
    try {
      const data = await citaService.updateCita(id, citaData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingCita = createAsyncThunk(
  'citas/deleteExistingCita',
  async (id, { rejectWithValue }) => {
    try {
      await citaService.deleteCita(id);
      return id; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const citaSlice = createSlice({
  name: 'citas',
  initialState,
  reducers: {
    clearCitasError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCitas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.citas = action.payload.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      })
      .addCase(fetchCitas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCitasParaDashboard.fulfilled, (state, action) => {
        state.isLoadingDashboardCitas = false;
        state.citasDashboard = action.payload.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      })
      .addCase(addNewCita.pending, (state) => {
        state.isLoading = true; // Podrías usar un isLoadingAdd específico
      })
      .addCase(addNewCita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.citas = [...state.citas, action.payload].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      })
      .addCase(addNewCita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingCita.pending, (state) => {
        state.isLoading = true; // Podrías usar un isLoadingUpdate específico
      })
      .addCase(updateExistingCita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.citas = state.citas.map(c => c._id === action.payload._id ? action.payload : c)
                                 .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      })
      .addCase(updateExistingCita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteExistingCita.pending, (state) => {
        state.isLoading = true; // Podrías usar un isLoadingDelete específico
      })
      .addCase(deleteExistingCita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.citas = state.citas.filter(c => c._id !== action.payload);
      })
      .addCase(deleteExistingCita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCitasError } = citaSlice.actions;
export default citaSlice.reducer;