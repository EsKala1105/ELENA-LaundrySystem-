/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import "react-time-picker/dist/TimePicker.css";
import { Modal } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useSelector } from "react-redux";
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
import {
  defaultHoraPrevista,
  showFactura,
  simboloMoneda,
} from "../../../services/global";
import { modals } from "@mantine/modals";
import axios from "axios";
import {
  DateCurrent,
  formatFecha,
  formatHora,
  formatRoundedNumber,
} from "../../../utils/functions";
import Promocion from "./Promocion/Promocion";
import { useDisclosure } from "@mantine/hooks";
import InfoPagos from "./InfoPagos/InfoPagos";
import MetodoPago from "../MetodoPago/MetodoPago";
import SwtichDimension from "../../SwitchDimension/SwitchDimension";
import InfoFactura from "./InfoFactura/InfoFactura";

const OrdenServicio = ({ mode, onAction, infoDefault, titleMode }) => {
  const [mPromocion, { open: openModalPromocion, close: closeModalPromocion }] =
    useDisclosure(false);

  const [
    mMetodoPago,
    { open: openModalMetodoPago, close: closeModalMetodoPago },
  ] = useDisclosure(false);

  const iCodigo = useSelector((state) => state.codigo.infoCodigo.codActual);
  const { InfoImpuesto: iImpuesto, InfoPuntos: iPuntos } = useSelector(
    (state) => state.modificadores
  );
  const iPromocion = useSelector((state) => state.promocion.infoPromocion);
  const iUsuario = useSelector((state) => state.user.infoUsuario);
  const iDelivery = useSelector((state) => state.servicios.serviceDelivery);
  const iServicios = useSelector((state) => state.servicios.listServicios);
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const listClientes = useSelector((state) => state.clientes.listClientes);

  const [sidePanelVisible, setSidePanelVisible] = useState(false);

  const [listCupones, setListCupones] = useState([]);

  const [infoCliente, setInfoCliente] = useState(null);
  const [infoPagos, setInfoPagos] = useState([]);

  const [currentPago, setCurrentPago] = useState();

  const [onDescuento, setOnDescuento] = useState(false);
  const [onPromocion, setOnPromocion] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    Items: Yup.array()
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
          cantidad: isDelivery ? true : mode !== "UPDATE" ? false : true,
          item: true,
          descripcion: isDelivery,
          total:
            mode !== "UPDATE"
              ? false
              : isDelivery && mode !== "UPDATE"
              ? false
              : true,
          action: isDelivery ? true : mode !== "UPDATE" ? false : true,
        },
      };
    });
  };

  const formik = useFormik({
    initialValues: {
      dni: "",
      name: "",
      Modalidad: "Tienda",
      direccion: "",
      celular: "",
      dateRecojo: new Date(),
      datePrevista: new Date(),
      dayhour: defaultHoraPrevista,
      Items: [],
      descuento: 0,
      modoDescuento: "Promocion",
      factura: false,
      subTotal: 0,
      cargosExtras: {
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
      totalNeto: 0,
      gift_promo: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      let correcciones = [];
      const promociones = values.cargosExtras.beneficios.promociones;
      const existPromocion = promociones.length > 0 ? true : false;

      if (values.modoDescuento === "Promocion" && existPromocion) {
        correcciones = await validItems(promociones);
      }
      if (correcciones.length > 0) {
        alert(`La Promoción Exige:\n\n${correcciones.join("\n")}`);
      } else {
        if (mode === "NEW") {
          const thereIsPromo = iPromocion.length > 0;
          const thereIsPromoActiva = iPromocion.some(
            (promocion) => promocion.state === "activo"
          );

          if (thereIsPromo && thereIsPromoActiva) {
            openModalPromocion();
          } else {
            openModal([]);
          }
        } else {
          openModal([]);
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
      return data;
    } catch (error) {
      // Captura errores y devuelve un mensaje de error genérico
      return {
        mensaje: "Error al hacer la solicitud: " + error.message,
      };
    }
  };

  const validItems = async (promociones) => {
    const listItems = formik.values.Items;
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
      let infoCupon;

      infoCupon = {
        alcance: p.alcance,
        cantidadMin: p.cantidadMin || 0,
        codigo: p.codigoPromocion,
        descripcion: p.descripcion,
        descuento: p.descuento,
        prenda: p.prenda,
        tipoDescuento: p.tipoDescuento,
        tipoPromocion: p.tipoPromocion,
      };
      const idServicios = infoCupon.prenda;

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

      const cantMin = infoCupon.cantidadMin;

      const handleGetCaActual = (atributo) =>
        itemsValidos.reduce((total, item) => total + +item[atributo], 0);

      let infoFaltante = "";
      let cantActual = 0;
      if (infoCupon.tipoPromocion === "Varios") {
        // Varios
        if (infoCupon.tipoDescuento === "Porcentaje") {
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

      if (infoCupon.tipoPromocion === "Unico") {
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
          if (infoCupon.tipoDescuento === "Monto") {
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
    closeModalPromocion();
    setOnPromocion(false);
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

  const handleGetInfo = async (info) => {
    const infoIntem = info.Items.map((p) => ({
      identificador: p.identificador,
      tipo: p.tipo,
      cantidad: p.cantidad,
      item: p.item,
      simboloMedida: p.simboloMedida,
      descripcion: p.descripcion,
      precio: p.price,
      total: p.total,
    }));

    const infoPago = currentPago
      ? {
          ...currentPago,
          date: {
            fecha: DateCurrent().format4,
            hora: DateCurrent().format3,
          },
          isCounted: true,
          idUser: iUsuario._id,
        }
      : null;

    let finalUpdatePromo = JSON.parse(JSON.stringify(info.cargosExtras));
    if (info.modoDescuento === "Promocion" && mode !== "UPDATE") {
      finalUpdatePromo.beneficios.promociones = listCupones;
      finalUpdatePromo.beneficios.puntos = 0;
      finalUpdatePromo.descuentos.puntos = 0;
    } else if (info.modoDescuento === "Puntos" && mode !== "UPDATE") {
      finalUpdatePromo.beneficios.promociones = [];
      finalUpdatePromo.descuentos.promocion = 0;
    }

    const infoOrden = {
      dateRecepcion: {
        fecha: formatFecha(info.dateRecojo),
        hora: formatHora(info.dateRecojo),
      },
      Modalidad: info.Modalidad,
      Nombre: info.name,
      idCliente: infoCliente ? infoCliente._id : "",
      Items: infoIntem,
      celular: info.celular,
      direccion: info.direccion,
      datePrevista: {
        fecha: formatFecha(info.datePrevista),
        hora: info.dayhour,
      },
      dateEntrega: {
        fecha: "",
        hora: "",
      },
      descuento: info.descuento,
      dni: info.dni,
      factura: info.factura,
      subTotal: info.subTotal,
      cargosExtras: finalUpdatePromo,
      totalNeto: info.totalNeto,
      modeRegistro: "nuevo",
      modoDescuento: info.modoDescuento,
      gift_promo: info.gift_promo,
      attendedBy: {
        name: iUsuario.name,
        rol: iUsuario.rol,
      },
    };

    onAction({
      infoOrden,
      infoPago,
      rol: iUsuario.rol,
    });

    formik.handleReset();
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
              itemsConsideradas = formik.values.Items;
            } else {
              itemsConsideradas = formik.values.Items.filter((elemento) =>
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
            itemsConsideradas = formik.values.Items.filter(
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
    recalculatePromoDescuento();
  }, [formik.values.Items, listCupones.length, formik.values.modoDescuento]);

  useEffect(() => {
    if (onDescuento === true) {
      if (formik.values.modoDescuento === "Promocion" && mode !== "UPDATE") {
        if (listCupones.length > 0) {
          setSidePanelVisible(true);
        } else {
          setSidePanelVisible(false);
        }
      }
      if (formik.values.modoDescuento === "Puntos" && mode !== "UPDATE") {
        if (infoCliente) {
          setSidePanelVisible(true);
        } else {
          setSidePanelVisible(false);
        }
      }
    } else {
      setSidePanelVisible(false);
    }
  }, [onDescuento, formik.values.modoDescuento, listCupones.length]);

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
    formik.values.Items,
    formik.values.modoDescuento,
    formik.values.cargosExtras.descuentos,
    formik.values.cargosExtras.descuento,
    formik.values.factura,
    formik.values.subTotal,
  ]);

  useEffect(() => {
    setCurrentPago();
  }, [formik.values.totalNeto]);

  useEffect(() => {
    if (infoDefault) {
      handleChageValue("dni", infoDefault.dni);
      handleChageValue("name", infoDefault.Nombre);
      handleChageValue("Modalidad", infoDefault.Modalidad);
      handleChageValue("direccion", infoDefault.direccion);
      handleChageValue("celular", infoDefault.celular);
      handleChageValue(
        "dateRecojo",
        moment(infoDefault.dateRecepcion.fecha, "YYYY-MM-DD").toDate()
      );
      handleChageValue(
        "datePrevista",
        moment(infoDefault.datePrevista.fecha, "YYYY-MM-DD").toDate()
      );
      handleChageValue("dayhour", infoDefault.datePrevista.hora);
      handleChageValue("Items", getItemsAdaptados(infoDefault.Items));
      handleChageValue("factura", infoDefault.factura);
      handleChageValue("subTotal", infoDefault.subTotal);
      handleChageValue("totalNeto", infoDefault.totalNeto);
      handleChageValue("gift_promo", infoDefault.gift_promo);
      handleChageValue("modoDescuento", infoDefault.modoDescuento);
      handleChageValue("descuento", infoDefault.descuento);
      handleChageValue("cargosExtras", infoDefault.cargosExtras);

      setInfoPagos(infoDefault.ListPago);
      const dCliente = listClientes.find(
        (cli) => cli._id === infoDefault.idCliente
      );

      if (infoDefault.descuento > 0) {
        setOnDescuento(true);
      }
      if (infoDefault.modoDescuento === "Promocion") {
        setListCupones(infoDefault.cargosExtras.beneficios.promociones);
        setInfoCliente(dCliente);
      }
      if (infoDefault.modoDescuento === "Puntos") {
        setInfoCliente({
          ...dCliente,
          scoreTotal:
            dCliente.scoreTotal + infoDefault.cargosExtras.beneficios.puntos,
        });
      }
    }
  }, [infoDefault]);

  return (
    <form onSubmit={formik.handleSubmit} className="content-recibo">
      <div className="head-recibo">
        <div
          className={`h-colum-data ${
            !InfoNegocio?.hasMobility ? "width-ct" : null
          }`}
        >
          <div className="title-recibo">
            <h1>
              {titleMode}&nbsp;-&nbsp;ORDEN SERVICIO N°&nbsp;
              {infoDefault ? `${infoDefault.codRecibo} ` : iCodigo}
            </h1>
            <span></span>
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
                  formik.setFieldValue("Items", [
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
                    ...formik.values.Items,
                  ]);
                } else {
                  const updatedItems = formik.values.Items.filter(
                    (item) => item.identificador !== iDelivery._id
                  );
                  formik.setFieldValue("Items", updatedItems);
                }
              }}
              colorOn="#75cbaf"
              // colorOff=""
              disabled={mode === "UPDATE" ? true : false}
            />
          </div>
        ) : null}
      </div>
      <div className="container">
        <div className="principal-data">
          <InfoCliente
            iCliente={infoCliente}
            changeICliente={setInfoCliente}
            // ------------------------------------- //
            mode={mode}
            changeValue={handleChageValue}
            values={formik.values}
            // ------------------------------------- //
            paso="1"
            descripcion="Información del Cliente"
            error={formik.errors}
            touched={formik.touched}
          />
          <InfoServicios
            iCliente={infoCliente}
            iDelivery={iDelivery}
            iPuntos={iPuntos}
            iServicios={iServicios}
            onDescuento={onDescuento}
            // ------------------------------------- //
            mode={mode}
            changeValue={handleChageValue}
            values={formik.values}
            // ------------------------------------- //
            paso="2"
            descripcion="¿Qué trajo el cliente?"
            error={formik.errors}
            touched={formik.touched}
          />
        </div>
        <div className="other-info">
          <InfoEntrega
            mode={mode}
            changeValue={handleChageValue}
            values={formik.values}
            paso="3"
            descripcion="¿Para cuando estara Listo?"
          />
          {showFactura ? (
            <InfoFactura
              mode={mode}
              changeValue={handleChageValue}
              values={formik.values}
              paso={showFactura ? "4" : "5"}
              descripcion="Agregar Factura"
            />
          ) : null}
          {mode !== "UPDATE" ? (
            <>
              <InfoDescuento
                setListCupones={(value) => {
                  setListCupones(value);
                }}
                iCliente={infoCliente}
                listCupones={listCupones}
                onDescuento={onDescuento}
                setOnDescuento={setOnDescuento}
                validCupon={validCupon}
                // ------------------------------------- //
                changeValue={handleChageValue}
                values={formik.values}
                // ------------------------------------- //
                paso="4"
                descripcion="¿Deseas Agregar Descuento?"
              />
              <InfoPago
                currentPago={currentPago}
                openModalMetodoPago={openModalMetodoPago}
                // ------------------------------------- //
                values={formik.values}
                // ------------------------------------- //
                paso="5"
                descripcion="Agregar Pago"
              />
            </>
          ) : (
            <InfoPagos
              values={formik.values}
              infoPagos={infoPagos}
              iUsuario={iUsuario}
              descripcion="Lista de Pagos"
            />
          )}
        </div>
      </div>
      {((formik.values.modoDescuento === "Promocion" &&
        listCupones.length > 0) ||
        (formik.values.modoDescuento === "Puntos" && infoCliente)) &&
      mode !== "UPDATE" ? (
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
        opened={mPromocion}
        onClose={() => {
          closeModalPromocion();
          setOnPromocion(false);
          formik.setFieldValue("gift_promo", []);
        }}
        size={650}
        scrollAreaComponent={ScrollArea.Autosize}
        title="¿ Deseas entregar uno o mas cupones de Promocion ?"
        centered
      >
        {onPromocion === true ? (
          <Promocion onAddCupon={openModal} />
        ) : (
          <div className="opcion">
            <button
              className="btn-action acp"
              type="button"
              onClick={() => {
                setOnPromocion(true);
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
      <Modal
        opened={mMetodoPago}
        onClose={() => {
          closeModalMetodoPago();
        }}
        size="auto"
        scrollAreaComponent={ScrollArea.Autosize}
        // title=""
        centered
      >
        <MetodoPago
          currentPago={currentPago}
          onConfirm={(value) => setCurrentPago(value)}
          onCancel={() => setCurrentPago()}
          onClose={closeModalMetodoPago}
          totalToPay={
            parseFloat(formik.values.totalNeto) -
            (infoPagos.reduce(
              (total, pago) => total + parseFloat(pago.total),
              0
            ) -
              (currentPago ? parseFloat(currentPago.total) : 0))
          }
        />
      </Modal>
    </form>
  );
};

export default OrdenServicio;
