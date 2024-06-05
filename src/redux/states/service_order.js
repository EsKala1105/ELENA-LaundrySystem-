import { createSlice } from "@reduxjs/toolkit";
import {
  AddOrdenServices,
  CancelEntrega_OrdenService,
  GetOrdenServices_DateRange,
  UpdateOrdenServices,
  // UpdateOrdenServices_PagoEntrega,
} from "../actions/aOrdenServices";
import { handleGetInfoPago } from "../../utils/functions";

const service_order = createSlice({
  name: "service_order",
  initialState: {
    infoServiceOrder: false,
    registered: [],
    reserved: [],
    lastRegister: null,
    orderServiceId: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setOrderServiceId: (state, action) => {
      state.orderServiceId = action.payload;
    },
    updateLastRegister: (state, action) => {
      state.lastRegister = {
        ...state.lastRegister,
        promotions: action.payload,
      };
    },
    setLastRegister: (state) => {
      state.lastRegister = null;
    },
    updateNotaOrden: (state, action) => {
      const index = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) state.registered[index] = action.payload;
      else state.registered.push(action.payload);
    },
    LS_updateOrder: (state, action) => {
      // Busca si existe un elemento con el mismo _id en state.registered
      const eRegistered = state.registered.findIndex(
        (item) => item._id === action.payload._id
      );
      const eReserved = state.reserved.some(
        (item) => item._id === action.payload._id
      );
      if (eRegistered !== -1) {
        // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
        Object.assign(state.registered[eRegistered], action.payload);
      } else if (eReserved && action.payload.estado === "registrado") {
        state.reserved = state.reserved.filter(
          (item) => item._id !== action.payload._id
        );
        state.registered.push(action.payload);
      }
    },
    LS_updateListOrder: (state, action) => {
      const listOrderUpdated = action.payload;
      listOrderUpdated.map((order) => {
        // Busca si existe un elemento con el mismo _id en state.registered
        const eRegistered = state.registered.findIndex(
          (item) => item._id === order._id
        );
        if (eRegistered !== -1) {
          // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
          Object.assign(state.registered[eRegistered], order);
        }
      });
    },
    LS_newOrder: (state, action) => {
      if (action.payload.estado === "reservado") {
        state.reserved.push(action.payload);
      }

      if (action.payload.estado === "registrado") {
        state.registered.push(action.payload);
      }
    },
    LS_changeListPago: (state, action) => {
      const { tipo, info } = action.payload;

      // Buscar la orden por su _id
      const orderToUpdateIndex = state.registered.findIndex(
        (order) => order._id === info.idOrden
      );

      // Verificar si se encontró la orden
      if (orderToUpdateIndex === -1) {
        console.error("Orden no encontrada");
        return;
      }

      // Clonar la orden para no mutar el estado directamente
      const orderToUpdate = { ...state.registered[orderToUpdateIndex] };

      let indexPago;
      if (tipo !== "added") {
        // Buscar el pago dentro de ListPago por su _id
        indexPago = orderToUpdate.ListPago.findIndex(
          (pago) => pago._id === info._id
        );

        // Verificar si se encontró el pago
        if (indexPago === -1) {
          console.error("Pago no encontrado");
          return;
        }
      }

      // Realizar la acción según el tipo
      if (tipo === "deleted") {
        // Eliminar el pago del array ListPago
        orderToUpdate.ListPago.splice(indexPago, 1);
      } else if (tipo === "updated") {
        // Actualizar el pago con la nueva información
        orderToUpdate.ListPago[indexPago] = info;
      } else if (tipo === "added") {
        // Verificar si el pago ya existe en ListPago
        if (!orderToUpdate.ListPago.some((pago) => pago._id === info._id)) {
          // Agregar el nuevo pago a ListPago solo si no existe
          orderToUpdate.ListPago.push(info);
        }
      }

      orderToUpdate.Pago = handleGetInfoPago(
        orderToUpdate.ListPago,
        orderToUpdate.totalNeto
      ).estado.toUpperCase();

      // Actualizar la orden en state.registered
      state.registered[orderToUpdateIndex] = orderToUpdate;
    },
    LS_changePagoOnOrden: (state, action) => {
      const { tipo, info } = action.payload;

      // Encontrar la orden por su _id
      const orderIndex = state.registered.findIndex(
        (order) => order._id === info.idOrden
      );

      // Verificar si la orden existe
      if (orderIndex === -1) {
        console.error("Orden no encontrada:", info.idOrden);
        return;
      }

      const order = state.registered[orderIndex];
      let updatedPagoIndex, existingPagoIndex; // Declaraciones fuera del switch

      // Realizar la acción según el tipo
      switch (tipo) {
        case "deleted":
          // Eliminar el pago del array ListPago
          order.listPago.splice(order.listPago.indexOf(info._id), 1);
          break;
        case "updated":
          // Buscar el pago por su _id y actualizarlo con la nueva información
          updatedPagoIndex = order.listPago.findIndex(
            (pagoId) => pagoId === info._id
          );
          if (updatedPagoIndex !== -1) {
            order.listPago[updatedPagoIndex] = info._id;
          } else {
            console.error("Pago no encontrado para actualizar:", info._id);
          }
          break;
        case "added":
          // Verificar si el pago ya existe en ListPago
          existingPagoIndex = order.listPago.indexOf(info._id);
          if (existingPagoIndex === -1) {
            // Agregar el nuevo pago a ListPago solo si no existe
            order.listPago.push(info._id);
          } else {
            console.error("El pago ya existe en ListPago:", info._id);
          }
          break;
        default:
          console.error("Tipo de acción no válido:", tipo);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(AddOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.estado === "reservado") {
          state.reserved.push(action.payload);
        }

        if (action.payload.estado === "registrado") {
          state.registered.push(action.payload);
        }

        state.lastRegister = action.payload;
      })
      .addCase(AddOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // Update
      .addCase(UpdateOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(UpdateOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1 && action.payload.estado === "registrado") {
          // si existe acutaliza
          state.registered[index] = action.payload;
        } else {
          // si no y esta es
          if (action.payload.estado === "registrado") {
            state.registered.push(action.payload);
          }
        }

        // Siempre q se actualiza es por ya esta registrado x eso si existe
        // alguna orden con id en reserved se quita

        state.reserved = state.reserved.filter(
          (item) => item._id !== action.payload._id
        );
      })
      .addCase(UpdateOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // List for Date Range
      .addCase(GetOrdenServices_DateRange.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(GetOrdenServices_DateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = action.payload.length > 0;
        state.reserved = action.payload.filter(
          (item) => item.estado === "reservado"
        );
        state.registered = action.payload.filter(
          (item) => item.estado === "registrado"
        );
      })
      .addCase(GetOrdenServices_DateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // Cancelar Entrega
      .addCase(CancelEntrega_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(CancelEntrega_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const indexRegistered = state.registered.findIndex(
          (item) => item._id === action.payload._id
        );
        if (indexRegistered !== -1)
          state.registered[indexRegistered] = action.payload;
        else state.registered.push(action.payload);
      })
      .addCase(CancelEntrega_OrdenService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setOrderServiceId,
  setLastRegister,
  updateNotaOrden,
  updateLastRegister,
  LS_newOrder,
  LS_updateOrder,
  LS_updateListOrder,
  LS_changeListPago,
  LS_changePagoOnOrden,
} = service_order.actions;
export default service_order.reducer;
