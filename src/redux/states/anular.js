import { createSlice } from '@reduxjs/toolkit';
import { AnularOrderService, GetAnuladoId } from '../actions/aAnular';

const anular = createSlice({
  name: 'anular',
  initialState: {
    anuladoId: null,
    ListAnulados: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List
      .addCase(AnularOrderService.pending, (state) => {
        state.isLoading = true;
        state.ListAnulados = false;
        state.error = null;
      })
      .addCase(AnularOrderService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ListAnulados = action.payload;
      })
      .addCase(AnularOrderService.rejected, (state, action) => {
        state.isLoading = false;
        state.ListAnulados = false;
        state.error = action.error.message;
      })
      // List for Id
      .addCase(GetAnuladoId.pending, (state) => {
        state.isLoading = true;
        state.anuladoId = false;
        state.error = null;
      })
      .addCase(GetAnuladoId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anuladoId = action.payload;
      })
      .addCase(GetAnuladoId.rejected, (state, action) => {
        state.isLoading = false;
        state.anuladoId = false;
        state.error = action.error.message;
      });
  },
});

// export const {  } = anular.actions;
export default anular.reducer;
