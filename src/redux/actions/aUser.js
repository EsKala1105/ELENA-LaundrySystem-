import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resetUser } from "../states/user";
import { Notify } from "../../utils/notify/Notify";
import { messageGeneral } from "../states/negocio";
import { socket } from "../../utils/socket/connect";

export const GetInfoUser = createAsyncThunk(
  "user/GetInfoUser",
  async (headers, { dispatch }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-user`,
        headers
      );
      return response.data;
    } catch (error) {
      // Manejar errores aquí
      if (error.response.status === 500) {
        Notify("Error de Sistema", error.response.data.mensaje, "fail");
      } else {
        if (error.response.status === 403) {
          if (error.response.data.type === "outTime") {
            await dispatch(
              messageGeneral({
                title: "Comunicado",
                message: error.response.data.mensaje,
                ico: "time-out",
              })
            );
          } else if (error.response.data.type === "locking") {
            await dispatch(
              messageGeneral({
                title: "Comunicado",
                message: error.response.data.mensaje,
                ico: "close-emergency",
              })
            );
          } else {
            Notify("Error", error.response.data.mensaje, "fail");
          }
        }
        dispatch(resetUser());
      }
    }
  }
);

export const GetListUser = createAsyncThunk("user/GetListUser", async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-list-users`
    );
    return response.data;
  } catch (error) {
    console.log(error.response.data.mensaje);
    Notify("Error", "No se pudieron obtener los datos del usuario", "fail");
    throw new Error(error);
  }
});

export const EditUser = createAsyncThunk("user/EditUser", async (data) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/edit-user/${data._id}`,
      data
    );
    if (response) {
      socket.emit("client:onChangeUser", response.data._id);
      socket.emit("client:onUpdateUser", response.data);
      Notify("Actualizacion", "Usuario Actualizado correctamente", "success");
    }
    return response.data;
  } catch (error) {
    console.log(error.response.data.mensaje);
    Notify("Error", "No se pudo editar los datos del usuario", "fail");
    throw new Error(error);
  }
});

export const RegisterUser = createAsyncThunk(
  "user/RegisterUser",
  async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/register`,
        data
      );
      if (response) {
        socket.emit("client:onNewUser", response.data);
        Notify(
          "Usuario Agregado Exitosamente",
          "Inicia Session para activar su cuenta, con el codigo enviado al correo",
          "success"
        );
      }
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        Notify("Error", "informacion Duplicada", "fail");
      } else {
        Notify("Error", "No se pudo registrar usuario", "fail");
      }
      console.log(error.response.data.mensaje);
      throw new Error(JSON.stringify(error.response.data));
    }
  }
);

export const DeleteUser = createAsyncThunk(
  "user/DeleteUser",
  async (userId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/delete-user/${userId}`
      );
      if (response.status === 200) {
        socket.emit("client:onDeleteUser", response.data);
        socket.emit("client:onDeleteAccount", response.data);
        Notify("Usuario Eliminado", "", "success");
        return userId;
      }
    } catch (error) {
      // Puedes manejar los errores aquí
      throw new Error("No se pudo eliminar el usuario");
    }
  }
);
