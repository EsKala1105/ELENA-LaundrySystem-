import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Notify } from "../../utils/notify/Notify";
import { socket } from "../../utils/socket/connect";

export const AddPago = createAsyncThunk("pago/AddPago", async (newPago) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-pago`,
      newPago
    );

    const infoRes = response.data;
    const { info } = infoRes;
    socket.emit("client:cPago", infoRes);
    Notify("Registro Exitoso", "", "success");
    return info;
  } catch (error) {
    console.log(error.response.data.mensaje);
    Notify("Error", "No se pudo agregar Pago", "fail");
    throw new Error(error);
  }
});

export const UpdatePago = createAsyncThunk(
  "gastos/UpdatePago",
  async ({ idPago, pagoUpdated }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/edit-pago/${idPago}`,
        pagoUpdated
      );

      const infoRes = response.data;
      console.log(infoRes);
      const { info } = infoRes;
      socket.emit("client:cPago", infoRes);
      return info;
    } catch (error) {
      // Puedes manejar los errores aquí
      Notify("Error", "No se pudo actualizar el pago -", "fail");
      throw new Error(error);
    }
  }
);

export const DeletePago = createAsyncThunk(
  "gastos/DeletePago",
  async (idPago) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/delete-pago/${idPago}`
      );

      const infoRes = response.data;
      const { info } = infoRes;
      socket.emit("client:cPago", infoRes);
      return info;
    } catch (error) {
      // Maneja los errores según tu lógica de aplicación
      Notify("Error", "No se pudo eliminar el pago", "fail");
      throw new Error(error);
    }
  }
);
