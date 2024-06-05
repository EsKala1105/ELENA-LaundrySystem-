import { createSlice } from "@reduxjs/toolkit";
import {
  getServicios,
  addServicio,
  updateServicio,
  deleteServicio,
} from "../actions/aServicios";

const servicios = createSlice({
  name: "servicios",
  initialState: {
    listServicios: [],
    serviceDelivery: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Obteniendo la lista de servicios
      .addCase(getServicios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServicios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listServicios = action.payload.servicios;
        state.serviceDelivery = action.payload.servicioDelivery;
      })
      .addCase(getServicios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Agregando un nuevo servicio
      .addCase(addServicio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addServicio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listServicios.push(action.payload);
      })
      .addCase(addServicio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Actualizando un servicio existente
      .addCase(updateServicio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateServicio.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedServicio = action.payload;
        const index = state.listServicios.findIndex(
          (servicio) => servicio._id === updatedServicio._id
        );
        if (index !== -1) {
          state.listServicios[index] = updatedServicio;
        }
      })
      .addCase(updateServicio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Eliminando un servicio
      .addCase(deleteServicio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteServicio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listServicios = state.listServicios.filter(
          (servicio) => servicio._id !== action.payload.idServicio
        );
      })
      .addCase(deleteServicio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default servicios.reducer;
