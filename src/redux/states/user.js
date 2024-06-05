import { clearLocalStorage, persistLocalStorage } from '../../utils/persistence.local-storage/localStorage.util';
import { createSlice } from '@reduxjs/toolkit';
import { GetInfoUser, GetListUser, EditUser, RegisterUser, DeleteUser } from '../actions/aUser';
import { notifications } from '@mantine/notifications';
export const userKey = 'user';

const user = createSlice({
  name: 'user',
  initialState: {
    listUsuario: [],
    infoUsuario: {},
    isLoading: false,
    error: null,
    warningDuplicated: [],
  },
  reducers: {
    clearDuplicated: (state, action) => {
      const valueToRemove = action.payload;
      if (valueToRemove !== '') {
        state.warningDuplicated = state.warningDuplicated.filter((item) => item !== valueToRemove);
      }
    },
    setInfoUser: (state, action) => {
      state.infoUsuario = action.payload;
    },
    loginUser: (action) => {
      persistLocalStorage(userKey, action.payload);
    },
    resetUser: (state) => {
      clearLocalStorage(userKey);
      notifications.clean();
      state.infoUsuario = {};
    },
    LS_FirtsLogin: (state, action) => {
      const id = action.payload;
      const index = state.listUsuario.findIndex((user) => user._id === id);
      if (index !== -1) {
        state.listUsuario[index]._validate = true;
      }
    },
    LS_DeleteUser: (state, action) => {
      state.listUsuario = state.listUsuario.filter((user) => user._id !== action.payload);
    },
    LS_AddUser: (state, action) => {
      state.listUsuario.push(action.payload);
    },
    LS_UpdateUser: (state, action) => {
      const updatedUser = action.payload;
      // Buscar el índice del usuario en el array listUsuario con el mismo ID
      const index = state.listUsuario.findIndex((user) => user._id === updatedUser._id);

      if (index !== -1) {
        // Si se encuentra, actualiza ese usuario
        state.listUsuario[index] = updatedUser;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Obtener info de Usuario Logueado
      .addCase(GetInfoUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetInfoUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoUsuario = action.payload;
      })
      .addCase(GetInfoUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Lista de Usuarios
      .addCase(GetListUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetListUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listUsuario = action.payload;
      })
      .addCase(GetListUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Editar Usuario
      .addCase(EditUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(EditUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload;
        // Buscar el índice del usuario en el array listUsuario con el mismo ID
        const index = state.listUsuario.findIndex((user) => user._id === updatedUser._id);

        if (index !== -1) {
          // Si se encuentra, actualiza ese usuario
          state.listUsuario[index] = updatedUser;
        }
      })
      .addCase(EditUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Registrar Usuario
      .addCase(RegisterUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(RegisterUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const exists = state.listUsuario.findIndex((item) => item._id === action.payload._id);
        if (!exists) {
          state.listUsuario.push(action.payload);
        }
      })
      .addCase(RegisterUser.rejected, (state, action) => {
        state.isLoading = false;
        const errorObject = JSON.parse(action.error.message);

        if ('type' in errorObject) {
          state.warningDuplicated = errorObject.duplicados;
          state.error = errorObject.mensaje;
        } else {
          state.error = action.error.message;
        }
      })
      // Eliminar DeleteUser
      .addCase(DeleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(DeleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Encuentra el índice del usuario que coincide con el ID en action.payload
        const index = state.listUsuario.findIndex((user) => user._id === action.payload);

        if (index !== -1) {
          // Si se encuentra el usuario, elimínalo del array
          state.listUsuario.splice(index, 1);
        }
      })
      .addCase(DeleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setInfoUser,
  loginUser,
  LS_FirtsLogin,
  resetUser,
  LS_DeleteUser,
  LS_AddUser,
  LS_UpdateUser,
  clearDuplicated,
} = user.actions;
export default user.reducer;
