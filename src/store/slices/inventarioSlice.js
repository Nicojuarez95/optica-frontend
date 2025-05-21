import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});

export default inventarioSlice.reducer;