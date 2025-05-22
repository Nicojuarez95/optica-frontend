import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventarioService from '../../services/inventarioService';

const initialState = {
  items: [], // Cambiado de 'citas' a 'items' para inventario
  // itemSeleccionado: null, // Podrías añadir esto si necesitas un panel de detalle para items
  isLoading: false,
  error: null,
  currentItem: null,
  // loading: 'idle', // Puede ser 'idle' | 'loading_list' | 'loading_item' | 'saving_item'
  loadingList: 'idle', // Para fetchInventario
  loadingItemDetail: 'idle', // Para fetchSingleInventarioItem
  savingItem: 'idle', // Para add/update/delete
  errorList: null,
  errorItemDetail: null,
  errorSavingItem: null,
  itemsStockBajo: [], // Aquí guardaremos los ítems con stock bajo
  isLoadingStockBajo: false, // Estado de carga específico para este widget
  errorStockBajo: null, 
};

// Thunks Asíncronos
export const fetchInventario = createAsyncThunk(
  'inventario/fetchInventario',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const data = await inventarioService.getInventario(filtros);
      return data; // El servicio devuelve el array de items directamente
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// --- NUEVO: Thunk para obtener ítems con stock bajo para el dashboard ---
export const fetchItemsStockBajoDashboard = createAsyncThunk(
  'inventario/fetchItemsStockBajoDashboard',
  async (filtrosDashboard = { alertaStock: true, limite: 5 }, { rejectWithValue }) => {
    // `alertaStock: true` es una sugerencia de parámetro que tu backend debería reconocer.
    // `limite: 5` para obtener, por ejemplo, los 5 ítems más críticos.
    try {
      const data = await inventarioService.getInventario(filtrosDashboard);
      return data; // El servicio devuelve el array de items que cumplen el filtro
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewItemInventario = createAsyncThunk(
  'inventario/addNewItemInventario',
  async (itemData, { rejectWithValue }) => {
    try {
      const data = await inventarioService.createItemInventario(itemData);
      return data; // El servicio devuelve el item creado
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingItemInventario = createAsyncThunk(
  'inventario/updateExistingItemInventario',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const data = await inventarioService.updateItemInventario(id, itemData);
      return data; // El servicio devuelve el item actualizado
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingItemInventario = createAsyncThunk(
  'inventario/deleteExistingItemInventario',
  async (id, { rejectWithValue }) => {
    try {
      await inventarioService.deleteItemInventario(id);
      return id; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    clearInventarioError: (state) => {
      state.error = null;
       state.errorList = null;
      state.errorItemDetail = null;
      state.errorSavingItem = null;
      state.errorStockBajo = null;
    },
    // seleccionarItem: (state, action) => { state.itemSeleccionado = action.payload; },
    // limpiarItemSeleccionado: (state) => { state.itemSeleccionado = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItemsStockBajoDashboard.fulfilled, (state, action) => {
        state.isLoadingStockBajo = false;
        state.itemsStockBajo = action.payload.sort((a, b) => a.stockActual - b.stockActual); 
      })
      .addCase(fetchInventario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
      })
      .addCase(fetchInventario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addNewItemInventario.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewItemInventario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [...state.items, action.payload].sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
      })
      .addCase(addNewItemInventario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingItemInventario.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateExistingItemInventario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map(i => i._id === action.payload._id ? action.payload : i)
                                 .sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
        // if (state.itemSeleccionado && state.itemSeleccionado._id === action.payload._id) {
        //     state.itemSeleccionado = action.payload;
        // }
      })
      .addCase(updateExistingItemInventario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteExistingItemInventario.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExistingItemInventario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(i => i._id !== action.payload);
        // if (state.itemSeleccionado && state.itemSeleccionado._id === action.payload) {
        //     state.itemSeleccionado = null;
        // }
      })
      .addCase(deleteExistingItemInventario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventarioError /*, seleccionarItem, limpiarItemSeleccionado*/ } = inventarioSlice.actions;
export default inventarioSlice.reducer;