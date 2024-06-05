/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import "react-time-picker/dist/TimePicker.css";
import { Modal } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import InfoCliente from "./InfoCliente/InfoCliente";
import "./ordenServicio.scss";
import InfoServicios from "./InfoServicios/InfoServicios";
import { Button, Text, ScrollArea } from "@mantine/core";
import InfoEntrega from "./InfoEntrega/InfoEntrega";
import InfoDescuento from "./InfoDescuento/InfoDescuento";
import { useState } from "react";
import { useEffect } from "react";
import InfoPromociones from "./InfoPromociones/InfoPromociones";
import InfoPuntos from "./InfoPuntos/InfoPuntos";
import InfoPago from "./InfoPago/InfoPago";
import { showFactura, simboloMoneda } from "../../../services/global";
import { modals } from "@mantine/modals";
import axios from "axios";
import {
  DateCurrent,
  formatRoundedNumber,
  handleGetInfoPago,
} from "../../../utils/functions";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes } from "../../../models";
import { DeletePago, UpdatePago } from "../../../redux/actions/aPago";
import Promocion from "./Promocion/Promocion";
import { useDisclosure } from "@mantine/hooks";
import InfoPagos from "./InfoPagos/InfoPagos";
import MetodoPago from "../MetodoPago/MetodoPago";
import Portal from "../Portal/Portal";
import SwtichDimension from "../../SwitchDimension/SwitchDimension";
import InfoFactura from "./InfoFactura/InfoFactura";

const OrdenServicio = ({
  mode,
  action,
  onAction,
  iEdit,
  titleMode,
  nameDefault,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const iCodigo = useSelector((state) => state.codigo.infoCodigo.codActual);
  const { InfoImpuesto: iImpuesto, InfoPuntos: iPuntos } = useSelector(
    (state) => state.modificadores
  );
  const iPromocion = useSelector((state) => state.promocion.infoPromocion);
  const iUsuario = useSelector((state) => state.user.infoUsuario);
  const iDelivery = useSelector((state) => state.servicios.serviceDelivery);
  const iServicios = useSelector((state) => state.servicios.listServicios);
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const [sidePanelVisible, setSidePanelVisible] = useState(false);

  const [listCupones, setListCupones] = useState([]);
  const [infoCliente, setInfoCliente] = useState(null);
  const [resValidCupon, setResValidCupon] = useState(null);

  const [iPago, setIPago] = useState();
  const [isPromocion, setIsPromocion] = useState(false);
  const [isPortalPago, setIsPortalPago] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    items: Yup.array()
      .min(1, "Debe haber al menos un item")
      .test(
        "categoria",
        "Debe haber al menos un item - Delivery no cuenta",
        function (value) {
          return value.some((item) => item.identificador !== iDelivery?._id);
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

  const getItemsAdaptados = (Items) => {
    return Items.map((item) => {
      // Transforma cada item a la nueva estructura
      const isDelivery = iDelivery?._id === item.identificador ? true : false;
      return {
        cantidad: item.cantidad,
        identificador: item.identificador,
        simboloMedida: item.simboloMedida,
        tipo: item.tipo,
        item: item.item,
        descripcion: item.descripcion,
        expanded: false, // Valor estático para el ejemplo
        price: item.precio,
        total: item.total, // Similar para 'total'
        disable: {
          cantidad: true,
          item: true,
          descripcion: isDelivery,
          total: iEdit?.modeEditAll ? false : true,
          action: true,
        },
      };
    });
  };

  const formik = useFormik({
    initialValues: {
      dni: iEdit ? iEdit.dni : "",
      name: iEdit
        ? iEdit.Nombre
        : mode === "Delivery" && nameDefault
        ? nameDefault
        : "",
      Modalidad: iEdit ? iEdit.Modalidad : mode,
      direccion: iEdit ? iEdit.direccion : "",
      phone: iEdit ? iEdit.celular : "",
      dateRecojo: iEdit?.dateRecepcion?.fecha
        ? moment(
            `${iEdit.dateRecepcion.fecha} ${iEdit.dateRecepcion.hora}`,
            "YYYY-MM-DD HH:mm"
          ).toDate()
        : new Date(),
      datePrevista: iEdit?.datePrevista?.fecha
        ? moment(iEdit.datePrevista.fecha, "YYYY-MM-DD").toDate()
        : new Date(),
      dayhour: iEdit?.datePrevista?.hora || "17:00",
      listPago: iEdit ? iEdit.ListPago : [],
      pago: iEdit
        ? handleGetInfoPago(iEdit.ListPago, iEdit.totalNeto).estado
        : "Pendiente",
      items: iEdit
        ? getItemsAdaptados(iEdit.Items)
        : mode === "Delivery"
        ? [
            {
              identificador: iDelivery?._id,
              tipo: "servicio",
              cantidad: 1,
              item: "Delivery",
              simboloMedida: "vj",
              descripcion: "Transporte",
              price: iDelivery?.precioVenta,
              total: iDelivery?.precioVenta,
              disable: {
                cantidad: true,
                item: true,
                descripcion: true,
                total: false,
                action: true,
              },
            },
          ]
        : [],
      descuento: iEdit ? iEdit.descuento : 0,
      modoDescuento: iEdit ? iEdit.modoDescuento : "Puntos",
      factura: iEdit ? iEdit.factura : false,
      subTotal: iEdit ? iEdit.subTotal : 0,
      cargosExtras: iEdit
        ? iEdit.cargosExtras
        : {
            beneficios: {
              puntos: 0,
              promociones: [],
            },
            descuentos: {
              puntos: 0,
              promocion: 0,
            },
            igv: {
              valor: iImpuesto.IGV,
              importe: 0,
            },
          },
      totalNeto: iEdit ? iEdit.totalNeto : 0,
      gift_promo: iEdit ? iEdit.gift_promo : [],
      onDescuento: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      let correcciones = [];
      if (
        iEdit?.estado !== "registrado" &&
        values.modoDescuento === "Promocion"
      ) {
        correcciones = await validItems(
          values.cargosExtras.beneficios.promociones
        );
      }
      if (correcciones.length > 0) {
        alert(`La Promoción Exige:\n\n${correcciones.join("\n")}`);
      } else {
        if (iEdit?.estado === "registrado") {
          openModal([]);
        } else {
          const thereIsPromo = iPromocion.length > 0;
          const thereIsPromoActiva = iPromocion.some(
            (promocion) => promocion.state === "activo"
          );

          if (thereIsPromo && thereIsPromoActiva) {
            open();
          } else {
            openModal([]);
          }
        }
      }
    },
  });

  const validCupon = async (codigoCupon) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/validar-cupon/${codigoCupon}`
      );
      const data = response.data;
      await setResValidCupon(data);
      return data;
    } catch (error) {
      // Captura errores y devuelve un mensaje de error genérico
      return {
        mensaje: "Error al hacer la solicitud: " + error.message,
      };
    }
  };

  const validItems = async (promociones) => {
    const listItems = formik.values.items;
    const ListCorrecciones = [];

    // si la promo es la misma reducirla a 1 sola
    const listP = promociones.reduce((result, item) => {
      const codigoPromocion = item.codigoPromocion;
      if (!result.some((r) => r.codigoPromocion === codigoPromocion)) {
        result.push(item);
      }

      return result;
    }, []);

    for (const p of listP) {
      const infoCupon = await validCupon(p.codigoCupon);

      const idServicios = infoCupon.promocion.prenda;

      let servicios = [];

      // Crear un arreglo con la información de los servicios asociados a cada identificador
      idServicios.forEach((serviceID) => {
        const infoService = iServicios.find((i) => i._id === serviceID);
        if (infoService) {
          // Verificar si se encontró la información del servicio
          servicios.push({
            identificador: infoService._id,
            servicio: infoService.nombre,
            simbolo: infoService.simboloMedida,
          });
        }
      });

      const identificadoresReferencia = servicios.map(
        (item) => item.identificador
      );

      // Filtrar los elementos de la lista base que coinciden con los identificadores de la lista de referencia
      const itemsValidos = listItems.filter((item) =>
        identificadoresReferencia.includes(item.identificador)
      );

      const cantMin = infoCupon.promocion.cantidadMin;

      const handleGetCaActual = (atributo) =>
        itemsValidos.reduce((total, item) => total + +item[atributo], 0);

      let infoFaltante = "";
      let cantActual = 0;
      if (infoCupon.promocion.tipoPromocion === "Varios") {
        // Varios
        if (infoCupon.promocion.tipoDescuento === "Porcentaje") {
          // Pocentaje
          cantActual = handleGetCaActual("cantidad");
        } else {
          // Monto
          cantActual = handleGetCaActual("total");
        }
      } else {
        // Unico
        cantActual = handleGetCaActual("cantidad");
      }

      const res = cantActual >= cantMin;

      if (infoCupon.promocion.tipoPromocion === "Unico") {
        if (!res) {
          infoFaltante = `${`Minimo ${cantMin}${
            servicios[0].simbolo
          } del servicio "${servicios[0].servicio}" y ${
            cantActual === 0
              ? "no registraste ninguno"
              : `solo registraste : ${cantActual}${servicios[0].simbolo}`
          }`}`;
        }
      } else {
        if (!res) {
          if (infoCupon.promocion.tipoDescuento === "Monto") {
            infoFaltante = `${`Minimo ${simboloMoneda}${cantMin} en gastos de servicio y ${
              cantActual === 0
                ? "no registraste ninguno"
                : `solo registro : ${simboloMoneda}${cantActual}`
            }`}`;
          }
        }
      }

      if (infoFaltante) {
        ListCorrecciones.push(infoFaltante);
      }
    }

    return ListCorrecciones;
  };

  const openModal = async (cups) => {
    let confirmationEnabled = true;
    close();
    setIsPromocion(false);
    const values = {
      ...formik.values,
      gift_promo: cups.length > 0 ? cups : [],
    };

    modals.openConfirmModal({
      title: "Registro de Orden de Servicio",
      centered: true,
      children: (
        <Text size="sm">
          ¿Estás seguro de registrar esta Orden de Servicio?
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      onCancel: () => formik.setFieldValue("gift_promo", []),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleGetInfo(values);
        }
      },
    });
  };

  function tFecha(fecha) {
    const fechaFormateada = moment(fecha).format("YYYY-MM-DD");
    return fechaFormateada;
  }

  function tHora(fecha) {
    const horaFormateada = moment(fecha).format("HH:mm");
    return horaFormateada;
  }

  const handleGetInfo = async (info) => {
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

    let finalUpdatePromo = info.cargosExtras;
    if (info.modoDescuento === "Promocion" && !iEdit) {
      finalUpdatePromo.beneficios.promociones = listCupones;
      finalUpdatePromo.beneficios.puntos = 0;
      finalUpdatePromo.descuentos.puntos = 0;
    } else if (info.modoDescuento === "Puntos" && !iEdit) {
      finalUpdatePromo.beneficios.promociones = [];
      finalUpdatePromo.descuentos.promocion = 0;
    }
    !iEdit ||
      iEdit.dateRecepcion.fecha === DateCurrent().format4 ||
      iEdit?.estado === "reservado";

    const infoOrden = {
      codRecibo: iEdit ? iEdit.codRecibo : iCodigo,
      dateRecepcion: {
        fecha: tFecha(info.dateRecojo),
        hora: tHora(info.dateRecojo),
      },
      Modalidad: info.Modalidad,
      Nombre: info.name,
      Items: infoIntem,
      celular: info.phone,
      direccion: info.direccion,
      datePrevista: {
        fecha: tFecha(info.datePrevista),
        hora: info.dayhour,
      },
      dateEntrega: {
        fecha: "",
        hora: "",
      },
      descuento: info.descuento,
      estadoPrenda: iEdit ? iEdit.estadoPrenda : "pendiente",
      estado: "registrado",
      dni: info.dni,
      factura: info.factura,
      subTotal: info.subTotal,
      cargosExtras: finalUpdatePromo,
      totalNeto: info.totalNeto,
      modeRegistro: "nuevo",
      notas: iEdit ? iEdit.notas : [],
      modoDescuento: info.modoDescuento,
      gift_promo: iEdit
        ? iEdit.estado === "reservado"
          ? info.gift_promo
          : iEdit.gift_promo
        : info.gift_promo,
      attendedBy: iEdit
        ? iEdit.attendedBy
        : {
            name: iUsuario.name,
            rol: iUsuario.rol,
          },
      lastEdit: iEdit
        ? [
            ...iEdit.lastEdit,
            {
              name: iUsuario.name,
              date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            },
          ]
        : [],
      typeRegistro: "normal",
    };

    onAction({
      infoOrden,
      infoPago: info.listPago,
      rol: iUsuario.rol,
    });

    formik.handleReset();
    handleNoPagar();
  };

  const handleNoPagar = (id) => {
    if (iEdit && iEdit.modeEditAll === false && id) {
      let confirmationEnabled = true;
      modals.openConfirmModal({
        title: "Elimiancion de Pago",
        centered: true,
        children: <Text size="sm">¿Estás seguro de Eliminar este Pago?</Text>,
        labels: { confirm: "Si", cancel: "No" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("eliminacion de pago cancelado"),
        onConfirm: () => {
          if (confirmationEnabled) {
            confirmationEnabled = false;
            dispatch(DeletePago(id));

            navigate(
              `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
            );
          }
        },
      });
    } else {
      if (
        action === "Guardar" ||
        (action === "Editar" && iEdit?.modeEditAll === true)
      ) {
        formik.setFieldValue("listPago", []);
        formik.setFieldValue("pago", "Pendiente");
      }
    }
    setIPago();
  };

  const handlePago = (value) => {
    setIPago(value);
    let newListPago = [];
    let newStatePago;
    if (value) {
      const iPago = {
        ...value,
        isCounted: true,
        idUser: iUsuario._id,
        date: {
          fecha: moment().format("YYYY-MM-DD"),
          hora: moment().format("HH:mm"),
        },
      };

      if (iEdit && iEdit.modeEditAll === false && iPago._id) {
        let confirmationEnabled = true;
        if (confirmationEnabled) {
          confirmationEnabled = false;
          dispatch(
            UpdatePago({
              idPago: iPago._id,
              pagoUpdated: value.isCounted === false ? value : iPago,
            })
          );
        }
        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
        );
      } else {
        if (
          action === "Guardar" ||
          (action === "Editar" && iEdit?.modeEditAll === true)
        ) {
          newListPago = [iPago];
        } else {
          newListPago = [...formik.values.listPago, iPago];
        }
      }
    } else {
      newListPago = [value];
      iEdit
        ? formik.values.listPago.filter((pago) => pago._id === value._id)
        : null;
    }

    formik.setFieldValue("listPago", newListPago);
    newStatePago = handleGetInfoPago(newListPago, formik.values.totalNeto);
    formik.setFieldValue("pago", newStatePago.estado);
  };

  const handleChageValue = (name, value) => {
    formik.setFieldValue(name, value);
  };

  const toggleSidePanel = () => {
    setSidePanelVisible(!sidePanelVisible);
  };

  const sumaTotalesItems = (listItems) => {
    return listItems.reduce((total, item) => {
      const ItemTotal = parseFloat(item.total);
      return isNaN(ItemTotal) ? total : total + ItemTotal;
    }, 0);
  };

  const recalculatePromoDescuento = () => {
    let updateCupon = listCupones;

    const cupTypeDsc = listCupones.filter(
      (cupon) => cupon.tipoDescuento === "Porcentaje"
    );

    // Agrupacion de cupones segun codigo
    const groupCupon = [
      ...new Set(cupTypeDsc.map((item) => item.codigoPromocion)),
    ].map((codigoPromocion) =>
      cupTypeDsc.filter((item) => item.codigoPromocion === codigoPromocion)
    );

    // Iterar a través de grupos de cupones
    if (groupCupon.length > 0) {
      for (const grupo of groupCupon) {
        for (const dsc of grupo) {
          let itemsConsideradas;
          if (dsc.tipoPromocion === "Varios") {
            if (dsc.alcance === "Todos") {
              itemsConsideradas = formik.values.items;
            } else {
              itemsConsideradas = formik.values.items.filter((elemento) =>
                dsc.prenda.includes(elemento.identificador)
              );
            }

            let sumaTotales = sumaTotalesItems(itemsConsideradas);

            const dscFinal = +parseFloat(
              sumaTotales * dsc.nMultiplicador
            ).toFixed(1);
            updateCupon = updateCupon.map((c) => {
              if (c.codigoCupon === dsc.codigoCupon) {
                return { ...c, descuento: dscFinal };
              }
              return c;
            });
            sumaTotales -= dscFinal;
          } else {
            const prenda = grupo[0].prenda[0];
            itemsConsideradas = formik.values.items.filter(
              (i) => i.identificador === prenda
            );
            if (itemsConsideradas.length > 0) {
              let sumaTotales = sumaTotalesItems(itemsConsideradas);

              // Calcular descuentos y actualizar sumaTotales

              const dscFinal = +parseFloat(
                sumaTotales * dsc.nMultiplicador
              ).toFixed(1);
              // Actualizar el descuento en cada registro según su código de cupón
              updateCupon = updateCupon.map((c) => {
                if (c.codigoCupon === dsc.codigoCupon) {
                  return { ...c, descuento: dscFinal };
                }
                return c;
              });
              sumaTotales -= dscFinal;
            } else {
              updateCupon = updateCupon.map((c) => {
                if (c.codigoCupon === dsc.codigoCupon) {
                  return { ...c, descuento: 0 };
                }
                return c;
              });
            }
          }

          formik.setFieldValue(
            "cargosExtras.beneficios.promociones",
            updateCupon
          );
          setListCupones(updateCupon);
        }
      }
    }

    const LCupones = updateCupon.length > 0 ? updateCupon : listCupones;

    const sumaTotales = LCupones.reduce((total, cupon) => {
      const descuentoTotal = parseFloat(cupon.descuento);
      return isNaN(descuentoTotal) ? total : total + descuentoTotal;
    }, 0);

    formik.setFieldValue("cargosExtras.descuentos.promocion", sumaTotales);
    formik.setFieldValue("descuento", sumaTotales);
  };

  useEffect(() => {
    if (!iEdit || iEdit?.estado === "reservado") {
      recalculatePromoDescuento();
    }
  }, [formik.values.items, listCupones.length, formik.values.modoDescuento]);

  useEffect(() => {
    if (formik.values.onDescuento === true) {
      if (formik.values.modoDescuento === "Promocion") {
        if (listCupones.length > 0) {
          setSidePanelVisible(true);
        } else {
          setSidePanelVisible(false);
        }
      }
      if (formik.values.modoDescuento === "Puntos") {
        if (infoCliente) {
          setSidePanelVisible(true);
        } else {
          setSidePanelVisible(false);
        }
      }
    } else {
      setSidePanelVisible(false);
    }
  }, [
    formik.values.onDescuento,
    formik.values.modoDescuento,
    listCupones.length,
  ]);

  useEffect(() => {
    const subTotal = formik.values.subTotal;

    let montoIGV = 0;
    if (formik.values.factura === true) {
      montoIGV = +(subTotal * formik.values.cargosExtras.igv.valor).toFixed(2);
    }
    formik.setFieldValue("cargosExtras.igv.importe", montoIGV);
    const total = subTotal + montoIGV;
    const descuento =
      formik.values.modoDescuento === "Puntos"
        ? formik.values.cargosExtras.descuentos.puntos
        : formik.values.cargosExtras.descuentos.promocion;
    formik.setFieldValue("descuento", descuento);
    const totalNeto = total - descuento;
    formik.setFieldValue("totalNeto", +formatRoundedNumber(totalNeto));
  }, [
    formik.values.cargosExtras.igv,
    formik.values.items,
    formik.values.modoDescuento,
    formik.values.cargosExtras.descuentos,
    formik.values.cargosExtras.descuento,
    formik.values.factura,
    formik.values.subTotal,
  ]);

  useEffect(() => {
    handleNoPagar();
  }, [formik.values.totalNeto]);

  return (
    <form onSubmit={formik.handleSubmit} className="content-recibo">
      <div className="head-recibo">
        <div
          className={`h-colum-data ${
            !InfoNegocio?.hasMobility ? "width-ct" : null
          }`}
        >
          <div className="title-recibo">
            <h1>{titleMode}&nbsp;</h1>
            <h1>
              ORDEN DE SERVICIO&nbsp;
              {iEdit?.modeRegistro === "antiguo" ? "(ANTIGUA)" : null}&nbsp;
            </h1>
            <h1>{iEdit ? `N° ${iEdit.codRecibo} ` : iCodigo}</h1>
          </div>
          <Button className="btn-saved" type="submit">
            {titleMode}
          </Button>
        </div>
        {InfoNegocio?.hasMobility ? (
          <div className="h-colum-modo">
            <SwtichDimension
              onSwitch="Tienda"
              offSwitch="Delivery"
              name="Modalidad"
              defaultValue={
                formik.values.Modalidad === "Delivery" ? false : true
              }
              handleChange={(value) => {
                formik.setFieldValue("Modalidad", value);
                if (value === "Delivery") {
                  formik.setFieldValue("items", [
                    {
                      identificador: iDelivery._id,
                      tipo: "servicio",
                      cantidad: 1,
                      item: "Delivery",
                      simboloMedida: "vj",
                      descripcion: "Movilidad",
                      price: iDelivery.precioVenta,
                      total: iDelivery.precioVenta,
                      disable: {
                        cantidad: true,
                        item: true,
                        descripcion: false,
                        total: false,
                        action: true,
                      },
                    },
                    ...formik.values.items,
                  ]);
                } else {
                  const updatedItems = formik.values.items.filter(
                    (item) => item.identificador !== iDelivery._id
                  );
                  formik.setFieldValue("items", updatedItems);
                }
              }}
              colorOn="#75cbaf"
              // colorOff=""
              disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
            />
          </div>
        ) : null}
      </div>
      <div className="container">
        <div className="principal-data">
          <InfoCliente
            changeValue={handleChageValue}
            values={formik.values}
            iEdit={iEdit}
            error={formik.errors}
            touched={formik.touched}
            iCliente={infoCliente}
            changeICliente={setInfoCliente}
            paso="1"
            descripcion="Información del Cliente"
          />
          <InfoServicios
            changeValue={handleChageValue}
            onReturn
            values={formik.values}
            iCliente={infoCliente}
            paso="2"
            descripcion="¿Qué trajo el cliente?"
            iEdit={iEdit}
            iDelivery={iDelivery}
            iPuntos={iPuntos}
            error={formik.errors}
            touched={formik.touched}
            iServicios={iServicios}
          />
        </div>
        <div className="other-info">
          <InfoEntrega
            changeValue={handleChageValue}
            values={formik.values}
            paso="3"
            descripcion="¿Para cuando estara Listo?"
            iEdit={iEdit}
          />
          {showFactura ? (
            <InfoFactura
              paso={showFactura ? "4" : "5"}
              descripcion="Agregar Factura"
              changeValue={handleChageValue}
              values={formik.values}
              iPuntos={iPuntos}
              iEdit={iEdit}
            />
          ) : null}
          {(iEdit && iEdit.modeEditAll) || !iEdit ? (
            <>
              <InfoDescuento
                changeValue={handleChageValue}
                setListCupones={(value) => {
                  setListCupones(value);
                }}
                iCliente={infoCliente}
                listCupones={listCupones}
                setResValidCupon={setResValidCupon}
                resValidCupon={resValidCupon}
                values={formik.values}
                paso="4"
                descripcion="¿Deseas Agregar Descuento?"
              />
              <InfoPago
                changeValue={handleChageValue}
                values={formik.values}
                paso="5"
                descripcion="Agregar Pago"
                handleNoPagar={handleNoPagar}
                handlePago={handlePago}
                iEdit={iEdit}
                isPortalPago={isPortalPago}
                setIsPortalPago={setIsPortalPago}
                iPago={iPago}
              />
            </>
          ) : (
            <InfoPagos
              changeValue={handleChageValue}
              descripcion="Lista de Pagos"
              handleNoPagar={handleNoPagar}
              setIPago={setIPago}
              setIsPortalPago={setIsPortalPago}
              listPago={formik.values.listPago}
              iUsuario={iUsuario}
            />
          )}
        </div>
        <div className="info-pago"></div>
      </div>
      {(formik.values.modoDescuento === "Promocion" &&
        listCupones.length > 0) ||
      (formik.values.modoDescuento === "Puntos" && infoCliente) ? (
        <div
          className={`side-info-extra ${
            sidePanelVisible ? "show-panel" : "hide-panel"
          }`}
        >
          <div className="content-body">
            {formik.values.modoDescuento === "Puntos" && infoCliente ? (
              <InfoPuntos iCliente={infoCliente} />
            ) : null}
            {formik.values.modoDescuento === "Promocion" &&
            listCupones.length > 0 ? (
              <InfoPromociones
                listCupones={listCupones}
                changeValue={handleChageValue}
                setListCupones={(value) => {
                  setListCupones(value);
                }}
              />
            ) : null}
          </div>

          <Button onClick={toggleSidePanel} className="btn-toggleside">
            {sidePanelVisible ? (
              <i className="fa-solid fa-angle-left" />
            ) : (
              <i className="fa-solid fa-angle-right" />
            )}
          </Button>
        </div>
      ) : null}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setIsPromocion(false);
          formik.setFieldValue("gift_promo", []);
        }}
        size={650}
        scrollAreaComponent={ScrollArea.Autosize}
        title="¿ Deseas entregar uno o mas cupones de Promocion ?"
        centered
      >
        {isPromocion === true ? (
          <Promocion onAddCupon={openModal} />
        ) : (
          <div className="opcion">
            <button
              className="btn-action acp"
              type="button"
              onClick={() => {
                setIsPromocion(true);
              }}
            >
              Si
            </button>
            <button
              className="btn-action neg"
              type="submit"
              onClick={() => openModal([])}
            >
              No
            </button>
          </div>
        )}
      </Modal>
      {isPortalPago === true && (
        <Portal
          onClose={() => {
            setIsPortalPago(false);
          }}
        >
          <MetodoPago
            handlePago={handlePago}
            infoPago={iPago}
            totalToPay={
              iEdit && iEdit.modeEditAll === false
                ? parseFloat(formik.values.totalNeto) -
                  (formik.values.listPago?.reduce(
                    (total, pago) => total + parseFloat(pago.total),
                    0
                  ) -
                    (iPago ? parseFloat(iPago?.total) : 0))
                : formik.values.totalNeto
            }
            handleNoPagar={handleNoPagar}
            onClose={setIsPortalPago}
            modeUse={iEdit ? (iEdit.modeEditAll ? "Reserved" : "Edit") : "New"}
          />
        </Portal>
      )}
    </form>
  );
};

export default OrdenServicio;
