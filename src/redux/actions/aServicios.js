/* eslint-disable no-unreachable */
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Notify } from "../../utils/notify/Notify";

// Obtener la lista de servicios
export const getServicios = createAsyncThunk(
  "servicios/getServicios",
  async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-servicios`
      );
      return response.data;
    } catch (error) {
      throw new Error(`No se pudieron obtener los servicios - ${error}`);
    }
  }
);

// Agregar un nuevo servicio
export const addServicio = createAsyncThunk(
  "servicios/addServicio",
  async (nuevoServicio) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-servicio`,
        nuevoServicio
      );
      return response.data;
    } catch (error) {
      throw new Error(`No se pudo agregar el servicio - ${error}`);
    }
  }
);

// Actualizar un servicio existente
export const updateServicio = createAsyncThunk(
  "servicios/updateServicio",
  async (data) => {
    const { idServicio, servicioActualizado } = data;

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/update-servicio/${idServicio}`,
        servicioActualizado
      );
      return response.data;
    } catch (error) {
      throw new Error(`No se pudo actualizar el servicio - ${error}`);
    }
  }
);

// Eliminar un servicio
export const deleteServicio = createAsyncThunk(
  "servicios/deleteServicio",
  async (idServicio, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/delete-servicio/${idServicio}`
      );
      const { idServicioEliminado, mensaje } = response.data;
      Notify(mensaje, "", "success");
      return idServicioEliminado;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
