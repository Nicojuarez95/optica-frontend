import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  citas: [],
  isLoading: false,
  error: null,
};

const citaSlice = createSlice({
  name: 'citas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});

export default citaSlice.reducer;