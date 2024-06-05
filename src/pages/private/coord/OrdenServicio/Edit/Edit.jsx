/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrdenServicio from "../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";

import { useDispatch, useSelector } from "react-redux";

import { UpdateOrdenServices } from "../../../../../redux/actions/aOrdenServices";
import { setOrderServiceId } from "../../../../../redux/states/service_order";

import { PrivateRoutes } from "../../../../../models";
import "./edit.scss";

const Editar = () => {
  //const [ClienteId, setClienteId] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const ClienteData = useSelector((state) => {
    const reserved = state.orden.reserved.find((item) => item._id === id);
    const registered = state.orden.registered.find((item) => item._id === id);

    return reserved || registered;
  });

  const ClienteId = useSelector((state) => state.orden.orderServiceId);

  const handleEditar = async (updateData) => {
    const { infoOrden, infoPago, rol } = updateData;
    await dispatch(UpdateOrdenServices({ id, infoOrden, infoPago, rol })).then(
      (res) => {
        if (res.payload) {
          dispatch(setOrderServiceId(false));
          if (ClienteId.estado === "reservado") {
            navigate(
              `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.IMPRIMIR_ORDER_SERVICE}/${id}`
            );
          } else {
            navigate(
              `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
            );
          }
        }
      }
    );
  };

  useEffect(() => {
    if (ClienteData) {
      dispatch(
        setOrderServiceId({
          ...ClienteData,
          modeEditAll: ClienteData.estado === "registrado" ? false : true,
        })
      );
    }
  }, [ClienteData]);

  return (
    <>
      {ClienteId ? (
        <div className="edit-orden-service">
          <OrdenServicio
            titleMode={
              ClienteId.estado === "reservado" ? "REGISTRAR" : "ACTUALIZAR"
            }
            mode={ClienteId.Modalidad}
            action={"Editar"}
            onAction={handleEditar}
            iEdit={ClienteId}
            onReturn={() => {
              navigate(
                `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}/`
              );
            }}
          />
        </div>
      ) : (
        <>
          <div>Loading...</div>
        </>
      )}
    </>
  );
};

export default Editar;
