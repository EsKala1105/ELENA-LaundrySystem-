import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { UpdateOrdenServices } from '../actions/aOrdenServices';
import { DeletePuntosCliente } from '../../services/default.services';

export const AnularOrderService = createAsyncThunk(
  'anular/AnularOrderService',
  async ({ id, infoCliente, infoAnulacion }, { dispatch }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/anular-factura`,
        infoAnulacion
      );

      const res = response.data;
      if (res) {
        dispatch(
          UpdateOrdenServices({
            id,
            info: { infoOrden: { estadoPrenda: 'anulado' } },
            rol: infoAnulacion.rol,
          })
        );

        if (infoCliente.dni) {
          // una vez anulado - eliminar puntaje de orden de servicio
          DeletePuntosCliente(infoCliente.dni, infoCliente._id);
        }
      }

      return res;
    } catch (error) {
      // Puedes manejar los errores aquí
      throw new Error(`No se Registro la Orden - ${error.response.data.mensaje}`);
    }
  }
);

export const GetAnuladoId = createAsyncThunk('anular/GetAnuladoId', async (id) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-anulado/${id}`);

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudo actualizar el cliente - ${error}`);
  }
});
