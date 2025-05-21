import { configureStore } from '@reduxjs/toolkit';
// Importaremos los reducers de los slices aquí
import authReducer from './slices/authSlice';
import pacienteReducer from './slices/pacienteSlice';
import citaReducer from './slices/citaSlice';
import inventarioReducer from './slices/inventarioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pacientes: pacienteReducer,
    citas: citaReducer,
    inventario: inventarioReducer,
    // Aquí añadirás otros reducers a medida que los crees
  },
  // El middleware Redux Thunk ya está incluido por defecto en configureStore,
  // lo cual es útil para manejar acciones asíncronas (llamadas API).
});
