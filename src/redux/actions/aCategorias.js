import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const addCategoria = createAsyncThunk('categorias/addCategoria', async (categoriaData) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-categoria`, categoriaData);
    return response.data;
  } catch (error) {
    throw new Error(`No se pudo crear la categoría - ${error}`);
  }
});

export const getListCategorias = createAsyncThunk('categorias/getListCategorias', async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-categorias`);
    return response.data;
  } catch (error) {
    throw new Error(`No se pudo obtener la lista de categorías - ${error}`);
  }
});

export const updateCategoria = createAsyncThunk(
  'categorias/updateCategoria',
  async ({ idCategoria, categoriaData }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-categorias/${idCategoria}`,
        categoriaData
      );
      return response.data;
    } catch (error) {
      throw new Error(`No se pudo actualizar la categoría - ${error}`);
    }
  }
);

// Eliminar una categoría
export const deleteCategoria = createAsyncThunk(
  'categorias/deleteCategoria',
  async (idCategoria, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/delete-categoria/${idCategoria}`
      );
      // Verificar la respuesta del servidor
      if (response.status === 200) {
        return { idCategoria };
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Devolver el mensaje de error y los items asociados
        return rejectWithValue({
          mensaje: error.response.data.mensaje,
          itemsAsociados: error.response.data.itemsAsociados,
        });
      } else {
        throw new Error(`No se pudo eliminar la categoría - ${error}`);
      }
    }
  }
);
