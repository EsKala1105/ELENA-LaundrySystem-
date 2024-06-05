/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  HeaderAdmin,
  HeaderCoord,
} from "../../components/PRIVATE/Header/index";
import { PrivateRoutes, PublicRoutes, Roles } from "../../models/index";
import { GetCodigos } from "../../redux/actions/aCodigo";
import { GetOrdenServices_DateRange } from "../../redux/actions/aOrdenServices";
import { GetMetas } from "../../redux/actions/aMetas";
import { DateCurrent, GetFirstFilter } from "../../utils/functions";
import {
  LS_changeListPago,
  LS_changePagoOnOrden,
  LS_newOrder,
  LS_updateListOrder,
  LS_updateOrder,
  setOrderServiceId,
} from "../../redux/states/service_order";

import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

import "./mainLayout_Private.scss";
import Gasto from "../../pages/private/coord/Gastos/Gasto";
import ReporteDiario from "../../pages/private/coord/Reporte/Diario/ReporteDiario";

import { LS_nextCodigo } from "../../redux/states/codigo";
import { GetImpuesto, GetPuntos } from "../../redux/actions/aModificadores";
import {
  LS_updateImpuestos,
  LS_updatePuntos,
} from "../../redux/states/modificadores";
import { GetPromocion } from "../../redux/actions/aPromociones";
import { LS_updatePromociones } from "../../redux/states/promociones";
import { GetInfoNegocio } from "../../redux/actions/aNegocio";
import { LS_updateNegocio } from "../../redux/states/negocio";
import { LS_FirtsLogin } from "../../redux/states/user";
import { useDisclosure } from "@mantine/hooks";
import { ScrollArea } from "@mantine/core";
import { Modal } from "@mantine/core";

import Trash from "./trash.png";
import CloseEmergency from "./close-emergency.png";
import DoubleLogin from "./double-login.png";
import UpdateUser from "./update-user.png";
import TimeOut from "../out-of-time.png";
import moment from "moment";
import LoaderSpiner from "../../components/LoaderSpinner/LoaderSpiner";
import { socket } from "../../utils/socket/connect";
import { GetCuadre } from "../../redux/actions/aCuadre";
import { GetListUser } from "../../redux/actions/aUser";
import { getListCategorias } from "../../redux/actions/aCategorias";
import { getServicios } from "../../redux/actions/aServicios";
import { GetTipoGastos } from "../../redux/actions/aTipoGasto";
import { updateRegistrosNCuadrados } from "../../redux/states/cuadre";

const PrivateMasterLayout = (props) => {
  const [
    mMessageGeneral,
    { open: openMessageGeneral, close: closeMessageGeneral },
  ] = useDisclosure(false);

  const [
    mAccionGeneral,
    { open: openAccionGeneral, close: closeAccionGeneral },
  ] = useDisclosure(false);

  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const [data, setData] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mTipoAccionGeneral, setMTipoAccionGeneral] = useState(null);

  const { reserved } = useSelector((state) => state.orden);

  const [loading, setLoading] = useState(true);

  const _handleShowModal = (title, message, ico) => {
    setData({ title, message, ico });
    openMessageGeneral();
    setTimeout(() => {
      closeMessageGeneral();
      navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          dispatch(
            GetOrdenServices_DateRange({
              dateInicio: GetFirstFilter().formatoD[0],
              dateFin: GetFirstFilter().formatoD[1],
            })
          ),
          dispatch(GetCodigos()),
          dispatch(GetTipoGastos()),
          dispatch(GetMetas()),
          dispatch(GetPromocion()),
          dispatch(GetImpuesto()),
          dispatch(GetPuntos()),
          dispatch(GetInfoNegocio()),
          dispatch(GetListUser()),
          dispatch(getListCategorias()),
          dispatch(getServicios()),
        ];

        const responses = await Promise.all(promises);

        if (responses.some((response) => response && response.error)) {
          setLoading(true);
          _handleShowModal(
            "Advertencia",
            "Error de sistema comunicarse con el Soporte Técnico",
            "close-emergency"
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error en alguna de las llamadas a dispatch:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    notifications.clean();
    if (reserved.length === 0) return;

    const reservedIds = reserved.map((r) => r._id);
    const existingNotifications = new Set(); // Conjunto para almacenar los IDs de las notificaciones existentes

    // Mostrar notificaciones para nuevas facturas reservadas y agregar sus IDs al conjunto
    reserved.forEach((r) => {
      if (!existingNotifications.has(r.Id)) {
        notifications.show({
          id: r._id,
          autoClose: false,
          withCloseButton: false,
          withBorder: true,
          title: `Delivery Pendiente - ${r.Nombre}`,
          message: "Falta registrar datos!",
          styles: () => ({
            root: {
              backgroundColor: "#5161ce",
              width: "250px",
              "&::before": { backgroundColor: "#fff" },
              "&:hover": { backgroundColor: "#1e34c3" },
            },
            title: { color: "#fff" },
            description: { color: "#fff" },
          }),
          onClick: () => {
            const currentPath = new URL(window.location.href).pathname;
            const dir = `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.FINISH_ORDEN_SERVICE_PENDING}/${r._id}`;
            if (dir !== currentPath) {
              dispatch(setOrderServiceId(false));
              navigate(dir);
            }
          },
        });
        existingNotifications.add(r._id);
      }
    });

    // Eliminar notificaciones correspondientes a elementos eliminados
    existingNotifications.forEach((notificationId) => {
      if (!reservedIds.includes(notificationId)) {
        notifications.remove(notificationId);
        existingNotifications.delete(notificationId);
      }
    });
  }, [reserved]);

  useEffect(() => {
    // ORDER
    socket.on("server:newOrder", (data) => {
      dispatch(LS_newOrder(data));
    });
    socket.on("server:orderUpdated", (data) => {
      dispatch(LS_updateOrder(data));
    });
    socket.on("server:updateListOrder", (data) => {
      dispatch(LS_updateListOrder(data));
    });
    socket.on("server:changeCuadre", (data) => {
      dispatch(GetCuadre({ date: DateCurrent().format4, id: InfoUsuario._id }));
    });
    // PAGO
    socket.on("server:cPago", (data) => {
      dispatch(LS_changePagoOnOrden(data));
      dispatch(LS_changeListPago(data));
      if (data.info.isCounted) {
        dispatch(updateRegistrosNCuadrados({ tipoMovimiento: "pagos", data }));
      }
    });
    // GASTO
    socket.on("server:cGasto", (data) => {
      dispatch(updateRegistrosNCuadrados({ tipoMovimiento: "gastos", data }));
    });
    // CODIGO
    socket.on("server:updateCodigo", (data) => {
      dispatch(LS_nextCodigo(data));
    });
    // PUNTOS
    socket.on("server:cPuntos", (data) => {
      dispatch(LS_updatePuntos(data));
    });
    // IMPUESTOS
    socket.on("server:cImpuesto", (data) => {
      dispatch(LS_updateImpuestos(data));
    });
    // PROMOCIONES
    socket.on("server:cPromotions", (data) => {
      dispatch(LS_updatePromociones(data));
    });
    // NEGOCIO
    socket.on("server:cNegocio", (data) => {
      const { horas, actividad } = data.funcionamiento;
      if (actividad === false) {
        if (InfoUsuario.rol !== Roles.ADMIN) {
          _handleShowModal(
            "Emergencia",
            "Cierre total del sistema",
            "close-emergency"
          );
        }
      } else {
        if (InfoUsuario.rol !== Roles.ADMIN) {
          const currentHour = moment();

          const startTime = moment(horas.inicio, "HH:mm");
          const endTime = moment(horas.fin, "HH:mm");

          if (currentHour.isBetween(startTime, endTime)) {
            dispatch(LS_updateNegocio(data));
          } else {
            _handleShowModal(
              "Comunicado",
              "Se encuentra fuera del Horario de Atencion",
              "time-out"
            );
          }
        } else {
          dispatch(LS_updateNegocio(data));
        }
      }
    });
    // LOGIN
    socket.on("server:onLogin", (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal(
          "Comunicado",
          "Se registro otro inicio de sesion con esta cuenta",
          "double-login"
        );
      }
    });
    // 1er LOGIN
    socket.on("server:onFirtLogin", (data) => {
      dispatch(LS_FirtsLogin(data));
    });
    // Cambio en los datos de usuario
    socket.on("server:onChangeUser", (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal(
          "Administracion",
          "Hubo una Actualizacion en sus datos, vuelva a ingresar nuevamente",
          "update-user"
        );
      }
    });
    // Elimancion de Usuario
    socket.on("server:onDeleteAccount", (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal(
          "Administracion",
          "Su cuenta ha sido ELIMINADA",
          "delete"
        );
      }
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:newOrder");
      socket.off("server:updateCodigo");

      socket.off("server:orderUpdated");
      socket.off("server:cPago");
      socket.off("server:cGasto");

      socket.off("server:updateListOrder");

      socket.off("server:cPricePrendas");
      socket.off("server:cPuntos");
      socket.off("server:cImpuesto");
      socket.off("server:cPromotions");
      socket.off("server:cNegocio");
      socket.off("server:onLogin");
      socket.off("server:onFirtLogin");
      socket.off("server:onDeleteAccount");
      socket.off("server:onChangeUser");
    };
  }, []);

  return (
    <div
      className={`principal_container_private ${
        loading ? "space-total" : null
      }`}
    >
      {loading === true ? (
        <LoaderSpiner />
      ) : (
        <>
          <div className="header_pcp">
            <HeaderCoord />
            {InfoUsuario.rol === Roles.ADMIN ||
            InfoUsuario.rol === Roles.GERENTE ? (
              <HeaderAdmin />
            ) : null}
          </div>
          <section
            className={`body_pcp ${
              InfoUsuario.rol === Roles.ADMIN ||
              InfoUsuario.rol === Roles.GERENTE
                ? "mode-admin"
                : "mode-user"
            }`}
          >
            {props.children}
          </section>

          {InfoUsuario.rol !== Roles.PERS ? (
            <div id="add-gasto" className={`btn-floating`}>
              <button className="ico-toggle">
                <i className="fa-solid fa-comment-dollar" />
              </button>
              <button
                className="btn-gasto"
                onClick={() => {
                  setMTipoAccionGeneral("Gasto");
                  openAccionGeneral();
                }}
              >
                Agregar Gasto
              </button>
            </div>
          ) : null}
          <div id="show-informe" className={`btn-floating`}>
            <button className="ico-toggle">
              <i className="fa-solid fa-clipboard-list" />
            </button>
            <button
              className="btn-informe"
              onClick={() => {
                setMTipoAccionGeneral("Informe");
                openAccionGeneral();
              }}
            >
              Informe Diario
            </button>
          </div>
        </>
      )}
      <Modal
        opened={mAccionGeneral}
        onClose={closeAccionGeneral}
        closeOnClickOutside={true}
        size="auto"
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        {mTipoAccionGeneral === "Gasto" ? (
          <Gasto onClose={closeAccionGeneral} />
        ) : mTipoAccionGeneral === "Informe" ? (
          <ReporteDiario onClose={closeAccionGeneral} />
        ) : null}
      </Modal>
      <Modal
        opened={mMessageGeneral}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        onClose={closeMessageGeneral}
        size={350}
        title={false}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <div className="content-message-general">
          <div className="body-ms">
            <div className="logo">
              <img
                className="ico"
                src={
                  data &&
                  (data.ico === "delete"
                    ? Trash
                    : data.ico === "close-emergency"
                    ? CloseEmergency
                    : data.ico === "double-login"
                    ? DoubleLogin
                    : data.ico === "update-user"
                    ? UpdateUser
                    : data.ico === "time-out"
                    ? TimeOut
                    : null)
                }
                alt=""
              />
            </div>
            <div className="header-mg">
              <h2>{data?.title}</h2>
              <p>{data?.message}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivateMasterLayout;
