import axios from "axios";
import { Notify } from "../utils/notify/Notify";
const baseURL = `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya`;

export const handleAddCliente = async (info) => {
  try {
    await axios.post(`${baseURL}/add-cliente`, info);
  } catch (error) {
    console.error("Error al obtener los datos:", error.message);
  }
};

export const createPuntosObj = (res, points) => {
  return {
    dni: res.dni,
    nombre: res.Nombre,
    phone: res.celular,
    infoScore: {
      idOrdenService: res._id,
      codigo: res.codRecibo,
      dateService: res.dateRecepcion,
      score: points,
    },
  };
};

export const UpdateDeliveryID = async (ID, newName) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-delivery/${ID}`,
      newName
    );
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
};

export const DeletePuntosCliente = async (dni, idOrdenService) => {
  try {
    await axios.put(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/lava-ya/update-puntos-orden-servicio/${dni}`,
      {
        idOrdenService,
      }
    );
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
};

export const GetOrderId = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-factura/${id}`
    );
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudo obtener Orden - ${error}`);
  }
};

export const GetDeliveryById = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-delivery/${id}`
    );
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudo obtener Orden - ${error}`);
  }
};

export const GetAnuladoId = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-anulado/${id}`
    );

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudo actualizar el cliente - ${error}`);
  }
};

export const GetDonadoId = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-donated/${id}`
    );

    return response.data;
  } catch (error) {
    console.log(error.response.data.mensaje);
    throw new Error(error);
  }
};

export const handleUpdateFactura = async (id, info) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-factura/${id}`,
      info
    );
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se Registro la Orden - ${error.response.data.mensaje}`);
  }
};

export const handleUseCupon = async (codigo) => {
  try {
    await axios.get(`${baseURL}/use-cupon/${codigo}`);
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudo actualizar el cliente - ${error}`);
  }
};

export const handleRegisterCupon = async (Promotions) => {
  try {
    const responses = await Promise.all(
      Promotions.map(async (p) => {
        return await axios.post(`${baseURL}/generar-cupon`, p);
      })
    );

    return responses; // Devuelve la matriz de respuestas
  } catch (error) {
    // Maneja los errores aquí
    throw new Error(`No se pudo actualizar el cliente - ${error}`);
  }
};

export const handleRemoveFStorage = async (id) => {
  try {
    await axios.delete(`${baseURL}/remove-from-warehouse/${id}`);
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify("Error", "No remover orden de almacen", "fail");
  }
};

// export const LogoutUser = async (token) => {
//   try {
//     const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/logout`, {
//       data: { token }, // Envía el token en el cuerpo de la solicitud
//     });

//     return response;
//   } catch (error) {
//     // Puedes manejar los errores aquí
//     throw new Error('No se pudieron obtener los datos del usuario');
//   }
// };

export const WSendMessage = (mensaje, phone) => {
  let webUrl;
  webUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(mensaje)}`;

  window.open(webUrl, "_blank");
};

export const GetInfoUsuario = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/get-user/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(error.response.data.mensaje);
    throw new Error(error.response.data.mensaje);
  }
};
