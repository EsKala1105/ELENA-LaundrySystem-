import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { Notify } from "../../utils/notify/Notify";
import { socket } from "../../utils/socket/connect";

export const GetOrdenServices_DateRange = createAsyncThunk(
  "service_order/GetOrdenServices_DateRange",
  async ({ dateInicio, dateFin }) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/get-factura/date/${dateInicio}/${dateFin}`
      );

      return response.data;
    } catch (error) {
      // Puedes manejar los errores aquí
      //Notify('Error', 'No se ontemer la lista de Ordenes de Servicio', 'fail');
      console.log(error.response.data.mensaje);
      throw new Error(`No se pudo actualizar el cliente - ${error}`);
    }
  }
);

export const AddOrdenServices = createAsyncThunk(
  "service_order/AddOrdenServices",
  async ({ infoOrden, infoPago, infoGastoByDelivery, rol }) => {
    try {
      const dataSend = {
        infoOrden,
        ...(infoPago && { infoPago }),
        rol,
        ...(infoOrden.Modalidad === "Delivery" && { infoGastoByDelivery }),
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-factura`,
        dataSend
      );

      const res = response.data;
      const { newOrder } = res;

      if ("listNewsPagos" in res) {
        const { listNewsPagos } = res;
        listNewsPagos.map((p) => {
          const pago = {
            tipo: "added",
            info: p,
          };
          socket.emit("client:cPago", pago);
        });
      }

      if ("newGasto" in res) {
        const { newGasto } = res;
        socket.emit("client:cGasto", newGasto);
      }

      if ("changeCliente" in res) {
        const { changeCliente } = res;
        socket.emit("client:cClientes", changeCliente);
      }

      if ("newCodigo" in res) {
        const { newCodigo } = res;
        socket.emit("client:updateCodigo", newCodigo);
      }

      socket.emit("client:newOrder", newOrder);

      return newOrder;
    } catch (error) {
      console.log(error.response.data.mensaje);
      Notify("Error", "No se registro la Orden de Servicio", "fail");
      throw new Error(error);
    }
  }
);

export const UpdateOrdenServices = createAsyncThunk(
  "service_order/UpdateOrdenServices",
  async ({
    id,
    infoOrden,
    infoPago,
    rol,
    infoAnulacion,
    infoGastoByDelivery,
  }) => {
    try {
      const dataSend = {
        infoOrden,
        rol,
        ...(infoPago && { infoPago }),
        ...(infoOrden.estadoPrenda === "anulado" && { infoAnulacion }),
        ...(infoOrden.Modalidad === "Delivery" &&
          infoOrden.estadoPrenda === "entregado" && { infoGastoByDelivery }),
      };
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-factura/${id}`,
        dataSend
      );
      const res = response.data;

      socket.emit("client:updateOrder", res);
      const { orderUpdated } = res;

      if ("listNewsPagos" in res) {
        const { listNewsPagos } = res;
        listNewsPagos.map((p) => {
          const pago = {
            tipo: "added",
            info: p,
          };
          socket.emit("client:cPago", pago);
        });
      }

      if ("newGasto" in res) {
        const { newGasto } = res;
        socket.emit("client:cGasto", newGasto);
      }

      if ("changeCliente" in res) {
        const { changeCliente } = res;
        socket.emit("client:cClientes", changeCliente);
      }

      return orderUpdated;
    } catch (error) {
      // Puedes manejar los errores aquí
      console.log(error.response.data.mensaje);
      Notify("Error", "No se actualizo la Orden de Servicio", "fail");
      throw new Error(error);
    }
  }
);

export const CancelEntrega_OrdenService = createAsyncThunk(
  "service_order/CancelEntrega_OrdenService",
  async (idOrden) => {
    try {
      // Lógica para cancelar entrega en el backend
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/cancel-entrega/${idOrden}`
      );

      const res = response.data;
      const { orderUpdated } = res;

      socket.emit("client:updateOrder", res);

      Notify("Éxito", "Entrega cancelada correctamente", "success");

      if ("changeCliente" in res) {
        const { changeCliente } = res;
        socket.emit("client:cClientes", changeCliente);
      }

      return orderUpdated;
    } catch (error) {
      console.error("Error al cancelar entrega:", error);
      Notify(
        "Error",
        "No se pudo realizar la cancelación de la Orden de Servicio",
        "fail"
      );
      throw new Error(error);
    }
  }
);
