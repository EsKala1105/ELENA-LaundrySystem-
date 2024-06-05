import { createSlice } from "@reduxjs/toolkit";
import { GetCuadre } from "../actions/aCuadre";
import { MONTOS_BASE } from "../../services/global";

// Función auxiliar para actualizar un registro en un array
const updateRegistro = (registros, nuevoRegistro) => {
  const indexToUpdate = registros.findIndex(
    (registro) => registro._id === nuevoRegistro._id
  );
  if (indexToUpdate !== -1) {
    registros[indexToUpdate] = nuevoRegistro;
  }
};

const cuadre = createSlice({
  name: "cuadre",
  initialState: {
    infoCuadre: null,
    lastCuadre: null,
    infoBase: null,
    cuadreActual: null,
    registroNoCuadrados: { gastos: [], pagos: [] },
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updateCuadre: (state, action) => {
      state.infoCuadre = action.payload;
    },
    updateLastCuadre: (state, action) => {
      state.lastCuadre = action.payload;
    },
    updateRegistrosNCuadrados: (state, action) => {
      const { tipoMovimiento, data } = action.payload;
      const { tipo, info } = data;

      // Determina qué array de registros actualizar
      const registrosToUpdate =
        tipoMovimiento === "gastos"
          ? state.registroNoCuadrados.gastos
          : state.registroNoCuadrados.pagos;

      switch (tipo) {
        case "added":
          registrosToUpdate.push(info);
          break;
        case "updated":
          updateRegistro(registrosToUpdate, info);
          break;
        case "deleted":
          state.registroNoCuadrados = {
            ...state.registroNoCuadrados,
            [tipoMovimiento]: registrosToUpdate.filter(
              (item) => item._id !== info._id
            ),
          };
          break;
        default:
          break;
      }
    },
    clearInfoCuadre: (state) => {
      state.infoCuadre = null;
      state.lastCuadre = null;
      state.infoBase = null;
      state.cuadreActual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List Cuadres
      .addCase(GetCuadre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetCuadre.fulfilled, (state, action) => {
        state.isLoading = false;
        const lastCuadre = action.payload.lastCuadre;
        const cuadreActual = action.payload.cuadreActual;
        const infoBase = {
          ...action.payload.infoBase,
          Montos: MONTOS_BASE,
        };

        const listCuadres = action.payload.listCuadres;
        const newListCuadres =
          listCuadres?.length > 0
            ? listCuadres.filter((c) => c._id !== cuadreActual._id)
            : [];
        state.infoCuadre = newListCuadres;
        state.lastCuadre = lastCuadre;
        state.lastCuadre = lastCuadre;
        state.infoBase = infoBase;
        state.registroNoCuadrados = action.payload.registroNoCuadrados;

        if (!cuadreActual.saved) {
          state.cuadreActual = { ...cuadreActual, Montos: MONTOS_BASE };
        } else {
          state.cuadreActual = cuadreActual;
        }
      })
      .addCase(GetCuadre.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  LS_updateCuadre,
  updateLastCuadre,
  clearInfoCuadre,
  updateRegistrosNCuadrados,
} = cuadre.actions;
export default cuadre.reducer;
