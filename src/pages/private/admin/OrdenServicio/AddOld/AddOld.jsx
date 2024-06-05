/* eslint-disable no-unexpected-multiline */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Autocomplete, NumberInput, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import React, { useEffect, useRef, useState } from "react";

import { useFormik } from "formik";
import * as Yup from "yup";

import { useNavigate } from "react-router-dom";

import BotonModel from "../../../../../components/PRIVATE/BotonModel/BotonModel";
import SwitchModel from "../../../../../components/SwitchModel/SwitchModel";
import InputSelectedPrendas from "../../../../../components/PRIVATE/InputSelectedPrenda/InputSelectedPrenda";
import MetodoPago from "../../../../../components/PRIVATE/MetodoPago/MetodoPago";
import Portal from "../../../../../components/PRIVATE/Portal/Portal";
import "./addOld.scss";

import { ReactComponent as Eliminar } from "../../../../../utils/img/OrdenServicio/eliminar.svg";

import Tranferencia from "../../../../../utils/img/OrdenServicio/Transferencia.png";
import Efectivo from "../../../../../utils/img/OrdenServicio/dinero.png";
import Tarjeta from "../../../../../utils/img/OrdenServicio/card.png";

import Tag from "../../../../../components/Tag/Tag";

import moment from "moment";

import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDispatch, useSelector } from "react-redux";
import { PrivateRoutes } from "../../../../../models";
import axios from "axios";

import { AddOrdenServices } from "../../../../../redux/actions/aOrdenServices";
import {
  documento,
  ingresoDigital,
  nameImpuesto,
  simboloMoneda,
} from "../../../../../services/global";
import {
  DateCurrent,
  formatRoundedNumber,
  formatThousandsSeparator,
  handleGetInfoPago,
} from "../../../../../utils/functions";
import ButtonSwitch from "../../../../../components/PRIVATE/MetodoPago/ButtonSwitch/ButtonSwitch";

const AddOld = () => {
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const infoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const { InfoImpuesto, InfoPuntos } = useSelector(
    (state) => state.modificadores
  );

  const [isPortal, setIsPortal] = useState(false);

  // Lista de clientes
  const [infoClientes, setInfoClientes] = useState([]);
  // Puntos del cliente Actual
  const [dataScore, setDataScore] = useState(false);
  // valor por puntos
  const [vScore, setVScore] = useState(null);
  // Impuesto
  const [impuesto, setImpuesto] = useState(null);

  const [iPago, setIPago] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const InfoServicios = useSelector((state) => state.servicios.listServicios);
  const InfoCategorias = useSelector(
    (state) => state.categorias.listCategorias
  );
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const getInfoDelivery = () => {
    const ICategory = InfoCategorias.find((cat) => cat.nivel === "primario");
    const IService = InfoServicios.find(
      (service) =>
        service.idCategoria === ICategory._id && service.nombre === "Delivery"
    );

    return IService;
  };

  const validationSchema = Yup.object().shape({
    codigo: Yup.string().required("Campo Numerico obligatorio (1 - 1000)"),
    name: Yup.string().required("Campo obligatorio"),
    dateRecojo: Yup.string().required("Ingrese Fecha (obligatorio)"),
    datePrevista: Yup.string().required("Ingrese Fecha (obligatorio)"),
    items: Yup.array()
      .min(1, "Debe haber al menos un item")
      .test(
        "categoria",
        "Debe haber al menos un item - Delivery no cuenta",
        function (value) {
          return value.some(
            (item) => item.identificador !== getInfoDelivery()._id
          );
        }
      )
      .of(
        Yup.object().shape({
          //cantidad: Yup.string().required("Campo obligatorio"),
          //descripcion: Yup.string().required("Campo obligatorio"),
          //total: Yup.string().required("Campo obligatorio"),
        })
      ),
  });

  const formik = useFormik({
    initialValues: {
      codigo: "",
      name: "",
      phone: "",
      direccion: "",
      dateRecojo: "",
      datePrevista: "",
      listPago: [],
      pago: "Pendiente",
      items: [],
      descuento: "",
      swModalidad: "Tienda",
      dni: "",
      subTotal: "",
      totalNeto: "",
      cargosExtras: {
        beneficios: {
          puntos: 0,
          promociones: [],
        },
        descuentos: {
          redondeo: 0,
          puntos: 0,
          promocion: 0,
        },
        igv: {
          valor: impuesto,
          importe: 0,
        },
      },
      factura: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      openModal(values);
    },
  });

  const openModal = (data) => {
    let confirmationEnabled = true;
    modals.openConfirmModal({
      title: "Registro de Orden de Servicio",
      centered: true,
      children: (
        <Text size="sm">
          ¿ Estas seguro de registrar esta Orden de Servicio ?
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleGetInfo(data);
        }
      },
    });
  };

  const addRowGarment = (idServicio) => {
    const IService = InfoServicios.find(
      (service) => service._id === idServicio
    );
    const ICategory = InfoCategorias.find(
      (cat) => cat._id === IService.idCategoria
    );

    const isDelivery =
      ICategory.nivel === "primario" && IService.nombre === "Delivery"
        ? true
        : false;
    const isOtros =
      ICategory.nivel === "primario"
        ? IService.nombre === "Otros"
          ? true
          : false
        : false;

    const newRow = {
      cantidad: 1,
      item:
        IService.nombre === "Otros" && ICategory.name === "Unico"
          ? ""
          : IService.nombre,
      descripcion: "",
      expanded: false,
      price: IService.precioVenta,
      total: IService.precioVenta,
      tipo: "servicio",
      identificador: IService._id,
      simboloMedida: IService.simboloMedida,
      disable: {
        cantidad: isDelivery ? true : false,
        item: isDelivery ? true : isOtros ? false : true,
        descripcion: isDelivery,
        total: false,
        action: isDelivery,
      },
    };

    return newRow;
  };

  function tFecha(fecha) {
    const fechaFormateada = moment(fecha).format("YYYY-MM-DD");
    return fechaFormateada;
  }

  function tHora(horaOriginal, cantidadHoras, antesDespues) {
    const operacion =
      antesDespues === "antes"
        ? "subtract"
        : antesDespues === "despues"
        ? "add"
        : null;

    if (operacion) {
      return moment(horaOriginal, "HH:mm")
        [operacion](cantidadHoras, "hours")
        .format("HH:mm");
    } else {
      return 'Formato no válido. Usa "antes" o "despues".';
    }
  }

  const handlePago = (value) => {
    let newListPago = [];
    let newStatePago;
    if (value) {
      newListPago.push(value);
      newStatePago = handleGetInfoPago(newListPago, formik.values.totalNeto);
      formik.setFieldValue("listPago", [value]);
      formik.setFieldValue("pago", newStatePago.estado);
    } else {
      newListPago = [value];
      const newStatePago = handleGetInfoPago(
        newListPago,
        formik.values.totalNeto
      );
      formik.setFieldValue("pago", newStatePago.estado);
    }
    setIPago(value);
  };

  const handleNoPagar = () => {
    let newListPago = [];
    const newStatePago = handleGetInfoPago(
      newListPago,
      formik.values.totalNeto
    );
    formik.setFieldValue("pago", newStatePago.estado);
    setIPago();
  };

  const handleGetInfo = (info) => {
    const infoIntem = info.items.map((p) => ({
      identificador: p.identificador,
      tipo: p.tipo,
      cantidad: p.cantidad,
      item: p.item,
      simboloMedida: p.simboloMedida,
      descripcion: p.descripcion,
      precio: p.price,
      total: p.total,
    }));

    const lPago = info.listPago.map((p) => {
      return {
        ...p,
        date: {
          fecha: tFecha(formik.values.dateRecojo),
          hora: DateCurrent().format3,
        },
        isCounted: false,
        idUser: InfoUsuario._id,
      };
    });
    2;
    const infoOrden = {
      codRecibo: info.codigo,
      dateRecepcion: {
        fecha: tFecha(info.dateRecojo),
        hora: tHora(infoNegocio.funcionamiento?.horas?.inicio, 1, "despues"),
      },
      Modalidad: info.swModalidad,
      Nombre: info.name,
      Items: infoIntem,
      celular: info.phone,
      direccion: info.direccion,
      datePrevista: {
        fecha: tFecha(info.datePrevista),
        hora: tHora(infoNegocio.funcionamiento?.horas?.fin, 1, "antes"),
      },
      dateEntrega: {
        fecha: "",
        hora: "",
      },
      descuento: info.descuento,
      estadoPrenda: "pendiente",
      estado: "registrado",
      dni: info.dni,
      factura: info.factura,
      subTotal: info.subTotal,
      cargosExtras: info.cargosExtras,
      totalNeto: info.totalNeto,
      modeRegistro: "antiguo",
      modoDescuento: "Puntos",
      notas: [],
      gift_promo: [],
      attendedBy: {
        name: InfoUsuario.name,
        rol: InfoUsuario.rol,
      },
      lastEdit: [],
      typeRegistro: "normal",
    };

    dispatch(
      AddOrdenServices({
        infoOrden,
        infoPago: lPago,
        rol: InfoUsuario.rol,
      })
    ).then((res) => {
      if (res.payload) {
        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
        );
      }
    });
  };

  const handleGetClientes = async (dni) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-clientes/${dni}`
      );
      const data = response.data;
      setInfoClientes(data);
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
    }
  };

  const validIco = (mensaje) => {
    return (
      <div className="ico-req">
        <i className="fa-solid fa-circle-exclamation ">
          <div className="info-req" style={{ pointerEvents: "none" }}>
            <span>{mensaje}</span>
          </div>
        </i>
      </div>
    );
  };

  const calculateTotalNeto = (items) => {
    let subtotal = 0;

    if (items && items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        const total = parseFloat(item.total) || 0;

        return sum + total;
      }, 0);
    }

    return subtotal;
  };

  useEffect(() => {
    setVScore(InfoPuntos);

    formik.setFieldValue("cargosExtras.igv.valor", InfoImpuesto.IGV);
    setImpuesto(InfoImpuesto.IGV);
  }, [InfoPuntos, InfoImpuesto]);

  useEffect(() => {
    const subtotal = Number(calculateTotalNeto(formik.values.items).toFixed(2));

    formik.setFieldValue("subTotal", subtotal);
  }, [formik.values.items]);

  useEffect(() => {
    const subTotal = formik.values.subTotal;
    let montoImpuesto = 0;
    if (formik.values.factura === true) {
      montoImpuesto = +(subTotal * impuesto).toFixed(2);
    }
    formik.setFieldValue("cargosExtras.igv.importe", montoImpuesto);
    const total = subTotal + montoImpuesto;
    const descuento = formik.values.cargosExtras.descuentos.puntos;
    formik.setFieldValue("descuento", descuento);
    const totalNeto = total - descuento;
    formik.setFieldValue("totalNeto", +formatRoundedNumber(totalNeto));
  }, [
    formik.values.cargosExtras.igv,
    formik.values.items,
    formik.values.cargosExtras.descuentos,
    formik.values.factura,
    formik.values.subTotal,
  ]);

  useEffect(() => {
    handleNoPagar();
  }, [formik.values.totalNeto]);

  return (
    <div className="space-ra">
      <div className="title-action">
        <h1 className="elegantshadow">Agregando Orden de Servicio</h1>
        <h1 className="elegantshadow">- Antigua -</h1>
      </div>
      <form onSubmit={formik.handleSubmit} className="content-registro-antiguo">
        <div className="info-ra">
          <>
            <div className="space-paralelos">
              <div style={{ width: "300px", margin: "10px 20px" }}>
                <Autocomplete
                  name="dni"
                  onChange={(dni) => {
                    handleGetClientes(dni);
                    formik.setFieldValue("dni", dni);
                    setDataScore();
                    // formik.setFieldValue('name', '');
                    // formik.setFieldValue('phone', '');
                    formik.setFieldValue("cargosExtras.descuentos.puntos", 0);
                    formik.setFieldValue("cargosExtras.beneficios.puntos", 0);
                  }}
                  label={`${documento} :`}
                  placeholder={`Ingrese ${documento}`}
                  defaultValue={formik.values.dni}
                  onItemSubmit={(selected) => {
                    const cliente = infoClientes.find(
                      (obj) => obj.dni === selected.value
                    );
                    formik.setFieldValue("name", cliente.nombre);
                    formik.setFieldValue("phone", cliente.phone);

                    setDataScore(cliente);
                  }}
                  data={
                    infoClientes.length > 0
                      ? infoClientes.map((obj) => obj.dni)
                      : []
                  }
                />
                <div className="space-info">
                  <NumberInput
                    name="codigo"
                    label="Codigo :"
                    placeholder="N° Talonario"
                    value={formik.values.codigo}
                    precision={0}
                    onChange={(e) => {
                      formik.setFieldValue("codigo", !Number.isNaN(e) ? e : 0);
                    }}
                    min={1}
                    step={1}
                    hideControls
                    autoComplete="off"
                  />
                  {formik.errors.codigo &&
                    formik.touched.codigo &&
                    validIco(formik.errors.codigo)}
                </div>
                <div className="space-info">
                  <TextInput
                    name="name"
                    label="Nombre :"
                    radius="md"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    autoComplete="off"
                  />
                  {formik.errors.name &&
                    formik.touched.name &&
                    validIco(formik.errors.name)}
                </div>
                <TextInput
                  name="phone"
                  label="Celular :"
                  radius="md"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  autoComplete="off"
                />
                <TextInput
                  name="direccion"
                  label="Direccion :"
                  radius="md"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  autoComplete="off"
                />
              </div>
              <div style={{ width: "300px", margin: "10px 20px" }}>
                <div className="space-info">
                  <DateInput
                    label="Fecha Recojo :"
                    name="dateRecojo"
                    value={formik.values.dateRecojo}
                    onChange={(date) => {
                      formik.setFieldValue("dateRecojo", date);
                      formik.setFieldValue("datePrevista", date);
                    }}
                    placeholder="Ingrese Fecha"
                    maxDate={moment().toDate()}
                    // maxDate={moment().subtract(1, "day").toDate()}
                    //onNextYear
                  />
                  {formik.errors.dateRecojo &&
                    formik.touched.dateRecojo &&
                    validIco(formik.errors.dateRecojo)}
                </div>
                <div
                  className="content-date space-info"
                  style={{
                    display: formik.values.dateRecojo !== "" ? "block" : "none",
                  }}
                >
                  <label htmlFor="">Fecha Prevista :</label>
                  <div className="date-ma">
                    <DateInput
                      name="datePrevista"
                      value={formik.values.datePrevista}
                      onChange={(date) => {
                        formik.setFieldValue("datePrevista", date);
                      }}
                      placeholder="Ingrese Fecha"
                      minDate={formik.values.dateRecojo}
                    />
                    <div className="actions-date">
                      <button
                        type="button"
                        className="btn-preview"
                        onClick={() => {
                          const currentDate = formik.values.dateRecojo;
                          const newDate = new Date(
                            Math.max(
                              formik.values.datePrevista.getTime() -
                                24 * 60 * 60 * 1000,
                              currentDate.getTime()
                            )
                          );
                          formik.setFieldValue("datePrevista", newDate);
                        }}
                      >
                        {"<"}
                      </button>
                      <button
                        type="button"
                        className="btn-next"
                        onClick={() =>
                          formik.setFieldValue(
                            "datePrevista",
                            new Date(
                              formik.values.datePrevista.getTime() +
                                24 * 60 * 60 * 1000
                            )
                          )
                        }
                      >
                        {">"}
                      </button>
                    </div>
                  </div>
                  {formik.errors.datePrevista &&
                    formik.touched.datePrevista &&
                    validIco(formik.errors.datePrevista)}
                </div>
                <SwitchModel
                  title="Modo :"
                  onSwitch="Tienda"
                  offSwitch="Delivery"
                  name="swModalidad"
                  defaultValue={true}
                  onChange={(value) => {
                    // value = (TRUE O FALSE)
                    //const res = value ? 'Tienda' : 'Delivery';
                    if (value === true) {
                      formik.setFieldValue("swModalidad", "Tienda");
                      const updatedItems = formik.values.items.filter(
                        (item) => item.identificador !== getInfoDelivery()._id
                      );
                      formik.setFieldValue("items", updatedItems);
                    } else {
                      formik.setFieldValue("swModalidad", "Delivery");
                      formik.setFieldValue("items", [
                        ...formik.values.items,
                        {
                          identificador: getInfoDelivery()._id,
                          tipo: "servicio",
                          cantidad: 1,
                          item: "Delivery",
                          simboloMedida: "vj",
                          descripcion: "Recojo y Entrega",
                          price: getInfoDelivery().precioVenta,
                          total: getInfoDelivery().precioVenta,
                          disable: {
                            cantidad: true,
                            item: true,
                            descripcion: true,
                            total: false,
                            action: true,
                          },
                        },
                      ]);
                    }
                  }}
                />
                <SwitchModel
                  title="Factura :"
                  onSwitch="SI" // ON = TRUE
                  offSwitch="NO" // OFF = FALSE
                  name="factura"
                  defaultValue={false}
                  colorBackground="#F9777F" // COLOR FONDO
                  onChange={(value) => {
                    // value = (TRUE O FALSE)
                    formik.setFieldValue("factura", value);
                  }}
                />
              </div>
            </div>
            <div className="description-info">
              <div className="actions">
                <div className="button-actions">
                  {InfoNegocio.itemsAtajos.length > 0
                    ? InfoNegocio.itemsAtajos.map((items, index) => {
                        const IService = InfoServicios.find(
                          (service) => service._id === items
                        );

                        return (
                          <BotonModel
                            key={index}
                            name={`Agregar ${IService?.nombre}`}
                            listenClick={() => {
                              formik.setFieldValue("items", [
                                ...formik.values.items,
                                addRowGarment(IService?._id),
                              ]);
                            }}
                          />
                        );
                      })
                    : null}
                </div>
                <InputSelectedPrendas
                  listenClick={(info) => {
                    formik.setFieldValue("items", [
                      ...formik.values.items,
                      addRowGarment(info),
                    ]);
                  }}
                  tabI={"9"}
                />
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Cantidad</th>
                    <th>Item</th>
                    <th>Descripción</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.items.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <NumberInput
                          name={`items.${index}.cantidad`}
                          className="txtCantidad"
                          disabled={row.disable.cantidad}
                          value={formik.values.items[index].cantidad || ""}
                          formatter={(value) => formatThousandsSeparator(value)}
                          onChange={(value) => {
                            // Convierte la cadena a un número de punto flotante
                            let newQuantity = parseFloat(value);

                            // Si newQuantity es NaN o es un número muy pequeño, establece 0
                            if (
                              isNaN(newQuantity) ||
                              Math.abs(newQuantity) < 0.01
                            ) {
                              newQuantity = 0;
                            }

                            const price =
                              parseFloat(formik.values.items[index].price) || 0; // Precio del artículo

                            let newTotal = ""; // Inicializa la nueva cantidad total

                            // Calcula el total solo si newQuantity es un número válido
                            if (!isNaN(newQuantity)) {
                              newTotal = (newQuantity * price).toFixed(2); // Calcula el total y lo redondea a 2 decimales
                            }

                            // Actualiza los valores de cantidad y total en el formulario
                            formik.setFieldValue(
                              `items.${index}.cantidad`,
                              newQuantity // Asigna la nueva cantidad
                            );
                            formik.setFieldValue(
                              `items.${index}.total`,
                              +newTotal // Asigna el total calculado al campo total
                            );
                          }}
                          precision={2}
                          min={0.01}
                          step={1}
                          hideControls
                          autoComplete="off"
                          autoFocus={true}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="txtProducto"
                          disabled={row.disable.item}
                          name={`items.${index}.item`}
                          onChange={formik.handleChange}
                          autoComplete="off"
                          onBlur={formik.handleBlur}
                          value={formik.values.items[index].item}
                        />
                      </td>
                      <td
                        className="tADescription"
                        style={{
                          pointerEvents:
                            row.type === "Delivery" ? "none" : "painted",
                        }}
                      >
                        <div className="contentDes">
                          <div
                            id={`${index}-dsp`}
                            className="textarea-container"
                          >
                            <textarea
                              className="hide"
                              rows={5}
                              name={`items.${index}.descripcion`}
                              value={formik.values.items[index].descripcion}
                              disabled={row.disable.descripcion}
                              onChange={(e) => {
                                const inputValue = e.target.value;

                                // Verifica si el valor actual contiene el check "✔"
                                const hasCheck = inputValue.includes("✔ ");

                                // Si no hay un check y hay un texto, agrega el check automáticamente
                                const updatedValue = hasCheck
                                  ? inputValue
                                  : inputValue
                                  ? "✔ " + inputValue
                                  : "";

                                formik.setFieldValue(
                                  `items.${index}.descripcion`,
                                  updatedValue
                                );
                                // formik.setFieldValue(`items.${index}.expanded`, true);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();

                                  // Añade el check de "✔" al texto existente
                                  const updatedValue = `${formik.values.items[index].descripcion}\n✔ `;
                                  formik.setFieldValue(
                                    `items.${index}.descripcion`,
                                    updatedValue
                                  );

                                  formik.setFieldValue(
                                    `items.${index}.expanded`,
                                    true
                                  );
                                  // const scrollHeight = event.target.scrollHeight;
                                  // event.target.style.height = `${scrollHeight + 30}px`;
                                }
                              }}
                            />
                            <div
                              className="expand-button"
                              onClick={() => {
                                const element = document.getElementById(
                                  `${index}-dsp`
                                );

                                if (element) {
                                  const hideElement =
                                    element.querySelector(".hide");
                                  const showElement =
                                    element.querySelector(".show");
                                  const iconElement =
                                    element.querySelector("#ico-action");

                                  if (hideElement) {
                                    hideElement.classList.replace(
                                      "hide",
                                      "show"
                                    );
                                    iconElement.classList.replace(
                                      "fa-chevron-down",
                                      "fa-chevron-up"
                                    );
                                  } else if (showElement) {
                                    showElement.classList.replace(
                                      "show",
                                      "hide"
                                    );
                                    iconElement.classList.replace(
                                      "fa-chevron-up",
                                      "fa-chevron-down"
                                    );
                                  }
                                }
                              }}
                            >
                              <i
                                id="ico-action"
                                className="fa-solid fa-chevron-down"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <NumberInput
                          name={`items.${index}.total`}
                          className="txtTotal"
                          disabled={row.disable.total}
                          value={formik.values.items[index].total}
                          formatter={(value) => formatThousandsSeparator(value)}
                          onChange={(value) => {
                            formik.setFieldValue(`items.${index}.total`, value);
                          }}
                          precision={2}
                          min={0.01}
                          step={1}
                          hideControls
                          autoComplete="off"
                          autoFocus={true}
                          onBlur={formik.handleBlur}
                          required
                        />
                      </td>
                      <Tag
                        Etiqueta="td"
                        className="space-action"
                        onClick={() => {
                          if (
                            formik.values.items[index].identificador !==
                            getInfoDelivery()._id
                          ) {
                            const updatedItems = [...formik.values.items];
                            updatedItems.splice(index, 1);
                            formik.setFieldValue("items", updatedItems);
                          }
                        }}
                      >
                        {row.disable.action ? null : (
                          <Eliminar className="delete-row" />
                        )}
                      </Tag>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ marginTop: "10px" }}>
                    <td></td>
                    <td>Subtotal :</td>
                    <td>
                      {formatThousandsSeparator(formik.values.subTotal, true)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    {formik.values.factura ? (
                      <>
                        <td>
                          {nameImpuesto} ({(impuesto * 100).toFixed(0)} %) :
                        </td>
                        <td>
                          {formatThousandsSeparator(
                            formik.values.cargosExtras.igv.importe,
                            true
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                      </>
                    )}
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>Total :</td>
                    <td>
                      {formatThousandsSeparator(formik.values.totalNeto, true)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              {formik.errors.items && formik.touched.items && (
                <div className="error-message">{formik.errors.items}</div>
              )}
            </div>
            <div className="footer">
              <div className="f-Pay">
                <div className="content-sb">
                  <div className="input-pay ">
                    <label htmlFor="">Pago :</label>
                    <button
                      className="btn-switch"
                      type="button"
                      onClick={() => setIsPortal(!isPortal)}
                    >
                      <ButtonSwitch pago={formik.values.pago} />
                    </button>
                  </div>
                  {iPago ? (
                    <img
                      tabIndex="-1"
                      className={
                        iPago.metodoPago === "Efectivo"
                          ? "ico-efect"
                          : iPago.metodoPago === ingresoDigital
                          ? "ico-tranf"
                          : "ico-card"
                      }
                      src={
                        iPago.metodoPago === "Efectivo"
                          ? Efectivo
                          : iPago?.metodoPago === ingresoDigital
                          ? Tranferencia
                          : Tarjeta
                      }
                      alt=""
                    />
                  ) : null}
                </div>
                {iPago ? (
                  <div className="info-pago">{`${iPago.metodoPago} ${simboloMoneda}${iPago.total} : ${formik.values.pago}`}</div>
                ) : null}
              </div>
            </div>
            {isPortal === true && (
              <Portal
                onClose={() => {
                  setIsPortal(false);
                }}
              >
                <MetodoPago
                  handlePago={handlePago}
                  infoPago={iPago}
                  totalToPay={formik.values.totalNeto}
                  handleNoPagar={handleNoPagar}
                  onClose={setIsPortal}
                  modeUse={"New"}
                />
              </Portal>
            )}
            <div className="action-end">
              <button type="submit">Registrar</button>
              <button
                type="button"
                onDoubleClick={() =>
                  navigate(
                    `${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
                  )
                }
              >
                Cancelar
              </button>
            </div>
          </>
        </div>
      </form>
    </div>
  );
};

export default AddOld;
