/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  CancelEntrega_OrdenService,
  UpdateOrdenServices,
} from "../../../../../../redux/actions/aOrdenServices";
import {
  DateCurrent,
  handleGetInfoPago,
} from "../../../../../../utils/functions";

import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Anular from "../Anular/Anular";
import Entregar from "./Entregar/Entregar";
import Pagar from "./Pagar/Pagar";

import { PrivateRoutes } from "../../../../../../models";
import "./endProcess.scss";
import { socket } from "../../../../../../utils/socket/connect";
import { Notify } from "../../../../../../utils/notify/Notify";
import { simboloMoneda } from "../../../../../../services/global";
import { AddPago } from "../../../../../../redux/actions/aPago";

const EndProcess = ({ IdCliente, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [onAction, setOnAction] = useState("principal");

  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);

  const infoCliente = useSelector((state) =>
    state.orden.registered.find((item) => item._id === IdCliente)
  );

  const infoTipoGastoDeliveryEnvio = useSelector(
    (state) => state.tipoGasto.iDeliveryEnvio
  );

  const estadoPago = handleGetInfoPago(
    infoCliente?.ListPago,
    infoCliente?.totalNeto
  );

  const handleValidarCancelacion = async () => {
    await dispatch(CancelEntrega_OrdenService(infoCliente._id));
    onClose(false);
  };

  const handleAnular = (infoAnulacion) => {
    dispatch(
      UpdateOrdenServices({
        id: IdCliente,
        infoOrden: { estadoPrenda: "anulado" },
        rol: InfoUsuario.rol,
        infoAnulacion: {
          ...infoAnulacion,
          _id: IdCliente,
          idUser: InfoUsuario._id,
        },
      })
    ).then((res) => {
      if (res.payload) {
        onClose(false);
      }
    });
  };

  const openModalPagar = (values) => {
    let confirmationEnabled = true;
    modals.openConfirmModal({
      title: "Confirmar Pago",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres realizar el PAGO ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleEditPago(values);
        }
      },
    });
  };

  const openModalEntregar = (value) => {
    let confirmationEnabled = true;
    modals.openConfirmModal({
      title: "Confirmar Entrega",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres realizar la ENTREGA ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleEditEntrega(value);
        }
      },
    });
  };

  // Pago
  const handleEditPago = (values) => {
    const newPago = {
      ...values,
      idOrden: IdCliente,
      date: {
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
      },
      isCounted: true,
      idUser: InfoUsuario._id,
    };

    dispatch(AddPago(newPago));
  };

  // Entregado
  const handleEditEntrega = (values) => {
    let infoGastoByDelivery;
    if (infoCliente.Modalidad === "Delivery" && !InfoNegocio?.hasMobility) {
      infoGastoByDelivery = {
        idTipoGasto: infoTipoGastoDeliveryEnvio._id,
        tipo: infoTipoGastoDeliveryEnvio.name,
        motivo: `[${String(infoCliente.codRecibo).padStart(
          4,
          "0"
        )}] Delivery ENVIO en Transporte ${values.tipoTrasporte} - ${
          infoCliente.Nombre
        }`,
        date: {
          fecha: DateCurrent().format4,
          hora: DateCurrent().format3,
        },
        monto: values.mDevolucion,
        idUser: InfoUsuario._id,
      };
    }

    dispatch(
      UpdateOrdenServices({
        id: IdCliente,
        infoOrden: {
          ...infoCliente,
          dateEntrega: {
            fecha: DateCurrent().format4,
            hora: DateCurrent().format3,
          },
          estadoPrenda: "entregado",
          location: 1,
        },
        ...(infoGastoByDelivery && { infoGastoByDelivery }),
        rol: InfoUsuario.rol,
      })
    ).then((res) => {
      if (res.payload) {
        onClose(false);
      }
    });
  };

  const handleEntregar = () => {
    if (infoCliente.Modalidad === "Tienda" || InfoNegocio?.hasMobility) {
      console.log("tienda o delivery (propio)");
      openModalEntregar();
    } else {
      console.log("delivery particular");
      setOnAction("concluir");
    }
  };

  const validationSchema = Yup.object().shape({
    tipoTrasporte:
      infoCliente.Modalidad === "Delivery" && estadoPago.estado === "Completo"
        ? Yup.string().required("Escoja un tipo de transporte")
        : null,
    metodoPago:
      estadoPago.estado !== "Completo"
        ? Yup.string().required("Escoja Metodo de Pago")
        : null,
    mDevolucion:
      infoCliente.Modalidad === "Delivery" && estadoPago.estado === "Completo"
        ? Yup.string().required("Escoja Metodo de Pago")
        : null,
    total:
      estadoPago.estado !== "Completo"
        ? Yup.string().required("Ingrese Monto a Pagar")
        : null,
  });

  const vInitialPago = {
    total: "",
    metodoPago: "",
  };

  const vInitialEntrega = {
    tipoTrasporte: "",
    mDevolucion: "",
  };

  useEffect(() => {
    socket.on("server:orderUpdated:child", (data) => {
      if (infoCliente._id === data._id) {
        if (data.estadoPrenda === "anulado") {
          Notify("ORDERN DE SERVICIO ANULADO", "", "fail");
        } else {
          Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
        }
        onClose(false);
      }
    });

    socket.on("server:updateListOrder:child", (data) => {
      data.some((orden) => {
        if (infoCliente._id === orden._id) {
          if (orden.estadoPrenda === "donado") {
            Notify("ORDERN DE SERVICIO DONADO", "", "fail");
          } else {
            Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
          }
          onClose(false);
          return true; // Detener la iteración
        }
        return false; // Continuar la iteración
      });
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:orderUpdated:child");
      socket.off("server:updateListOrder:child");
    };
  }, []);

  return (
    <div className="actions-container">
      <div className="header-ac">
        <h1>
          {infoCliente.Nombre.split(" ").slice(0, 1).join(" ")} -{" "}
          {infoCliente.Modalidad}(N°{infoCliente.codRecibo})
        </h1>
      </div>
      <hr />
      <div className="body-ac">
        {onAction === "principal" ? ( // Principal
          <div className="actions-init">
            {/* {infoCliente.estadoPrenda === 'pendiente' ? (
              <button type="button" className="btn-exm" onClick={handleButtonClick}>
                {btnText}
              </button>
            ) : null} */}
            {infoCliente.estadoPrenda === "pendiente" &&
            estadoPago.estado === "Completo" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={handleEntregar}
              >
                Entregar
              </button>
            ) : null}
            {infoCliente.estadoPrenda === "pendiente" &&
            estadoPago.estado !== "Completo" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => {
                  setOnAction("concluir");
                }}
              >
                Pagar
              </button>
            ) : null}
            {InfoNegocio.rolQAnulan.includes(InfoUsuario.rol) &&
            infoCliente.estadoPrenda !== "entregado" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => setOnAction("anular")}
              >
                Anular
              </button>
            ) : null}
            {infoCliente.estadoPrenda !== "entregado" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => {
                  navigate(
                    `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.EDIT_ORDER_SERVICE}/${IdCliente}`
                  );
                }}
              >
                Editar
              </button>
            ) : null}
            {infoCliente.dateEntrega.fecha === DateCurrent().format4 &&
            infoCliente.estadoPrenda === "entregado" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={handleValidarCancelacion}
              >
                Cancelar Entrega
              </button>
            ) : null}
          </div>
        ) : onAction === "concluir" ? (
          <Formik
            initialValues={
              estadoPago.estado !== "Completo" ? vInitialPago : vInitialEntrega
            }
            validationSchema={validationSchema}
            onSubmit={(values, actions) => {
              if (estadoPago.estado !== "Completo") {
                openModalPagar(values);
              } else {
                openModalEntregar(values);
              }
              actions.resetForm();
              onClose();
            }}
          >
            {({ handleSubmit, setFieldValue, values, errors, touched }) => (
              <Form onSubmit={handleSubmit} className="content-pE">
                <div className="trasporte-pago">
                  {estadoPago.estado !== "Completo" ? (
                    <>
                      <div
                        className="data-pay"
                        style={
                          estadoPago.estado !== "Pendiente"
                            ? { display: "grid", gap: "15px" }
                            : { display: "flex", gap: "20px" }
                        }
                      >
                        <div style={{ display: "flex", gap: "20px" }}>
                          <div className="item-ipay total">
                            <div className="title">
                              <span>Total</span>
                            </div>
                            <div className="monto">
                              <span>
                                {simboloMoneda} {infoCliente.totalNeto}
                              </span>
                            </div>
                          </div>
                          {estadoPago.estado !== "Completo" &&
                          infoCliente.ListPago.length > 0 ? (
                            <div className="item-ipay adelanto">
                              <div className="title">
                                <span>Adelanto</span>
                              </div>
                              <div className="monto">
                                <span>
                                  {simboloMoneda} {estadoPago.pago}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="item-ipay falta">
                          <div className="title">
                            <span>Falta</span>
                          </div>
                          <div className="monto">
                            <span>
                              {simboloMoneda} {estadoPago.falta}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Pagar
                        setFieldValue={setFieldValue}
                        errors={errors}
                        touched={touched}
                        totalToPay={estadoPago.falta}
                      />
                    </>
                  ) : null}
                  {!InfoNegocio?.hasMobility &&
                  infoCliente.Modalidad === "Delivery" &&
                  estadoPago.estado === "Completo" ? (
                    <Entregar
                      setFieldValue={setFieldValue}
                      errors={errors}
                      touched={touched}
                      values={values}
                    />
                  ) : null}
                </div>
                <div className="actions-btns">
                  <button
                    type="button"
                    className="btn-exm"
                    onClick={() => setOnAction("principal")}
                  >
                    Retroceder
                  </button>
                  <button className="btn-exm" type="submit">
                    Guardar
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Anular onReturn={setOnAction} onAnular={handleAnular} />
        )}
      </div>
    </div>
  );
};

export default EndProcess;
