/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import "./infoDescuento.scss";
import SwtichDimension from "../../../SwitchDimension/SwitchDimension";
import { Button, TextInput } from "@mantine/core";
import Portal from "../../Portal/Portal";
import axios from "axios";
import { useSelector } from "react-redux";

const InfoDescuento = ({
  paso,
  descripcion,
  changeValue,
  values,
  setListCupones,
  listCupones,
  iCliente,
  setResValidCupon,
  resValidCupon,
}) => {
  const [stateDescuento, setStateDescuento] = useState(false);
  const [cupon, setCupon] = useState();

  const [PortalValidPromocion, setPortalValiPromocion] = useState(false);

  const iServicios = useSelector((state) => state.servicios.listServicios);

  const handleGetOpcionDescuento = (estado) => {
    if (estado === "SI") {
      setStateDescuento(true);
      changeValue("onDescuento", true);
    } else {
      setListCupones([]);
    }
  };

  const handleGetTipoDescuento = (tipo) => {
    if (tipo === "Puntos" && iCliente === null) {
      alert("CLIENTE NO SELECIONADO");
      tipo = "Promocion";
    }
    changeValue("modoDescuento", tipo);
  };

  const handleCancelarDescuento = () => {
    setStateDescuento(false);
    setListCupones([]);
    changeValue("onDescuento", false);
    changeValue("modoDescuento", "Promocion");
    // cancelar o volver a recargar el monto calculado
  };

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

  return (
    <div className="info-descuento">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        {stateDescuento ? (
          <>
            <Button
              className="cancel-descuento"
              onClick={handleCancelarDescuento}
            >
              X
            </Button>
            <div className="input-switch">
              <SwtichDimension
                title="Tipo de Descuento :"
                onSwitch="Promocion"
                offSwitch="Puntos"
                name="sw-tipo-descuento"
                defaultValue={values.modoDescuento === "Puntos" ? false : true}
                handleChange={handleGetTipoDescuento}
                // colorOn=""
                // colorOff=""
                // disabled=""
              />
            </div>
          </>
        ) : null}
        {stateDescuento === false ? (
          <div className="input-switch">
            <SwtichDimension
              //   title=""
              onSwitch="SI"
              offSwitch="NO"
              name="sw-stado-descuento"
              defaultValue={values.onDescuento}
              handleChange={handleGetOpcionDescuento}
              // colorOn=""
              // colorOff=""
              // disabled=""
            />
          </div>
        ) : null}
        {values.modoDescuento === "Promocion" && stateDescuento ? (
          <Button
            type="button"
            className="btn-promocion"
            onClick={() => {
              setPortalValiPromocion(true);
              setResValidCupon(null);
              setCupon();
            }}
          >
            Agregar Promocion
          </Button>
        ) : null}
      </div>
      {PortalValidPromocion ? (
        <Portal
          onClose={() => {
            setPortalValiPromocion(false);
          }}
        >
          <div className="valid-promocion">
            <h2>Ingresar codigo de Promocion</h2>
            <TextInput
              label="Codigo de Promocion :"
              className="input-promotion"
              radius="md"
              onChange={(e) => {
                setCupon(e.target.value);
                setResValidCupon(null);
              }}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn-valid"
              onClick={() => validCupon(cupon)}
            >
              Validar
            </button>

            {resValidCupon ? (
              <>
                <textarea
                  style={
                    resValidCupon?.validacion === true
                      ? { borderColor: "#00e676" }
                      : { borderColor: "#f5532f" }
                  }
                  className="description-info"
                  defaultValue={
                    resValidCupon?.validacion === true
                      ? resValidCupon?.promocion.descripcion
                      : resValidCupon?.respuesta
                  }
                  readOnly
                />
                {resValidCupon?.validacion === true ? (
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => {
                      // Buscar si ya existe un registro en la lista
                      const exists = listCupones.some(
                        (c) => c.codigoCupon === cupon
                      );
                      if (!exists) {
                        let dscFinal = 0;
                        if (
                          resValidCupon.promocion.tipoPromocion === "Varios"
                        ) {
                          if (
                            resValidCupon.promocion.tipoDescuento ===
                            "Porcentaje"
                          ) {
                            dscFinal = 0;
                          } else {
                            dscFinal = resValidCupon.promocion.descuento;
                          }
                        } else {
                          // tipoPromocion es Unico
                          if (
                            resValidCupon.promocion.tipoDescuento ===
                              "Gratis" &&
                            resValidCupon.promocion.tipoPromocion === "Unico"
                          ) {
                            const prendaEncontrada = iServicios.find(
                              (p) => p._id === resValidCupon.promocion.prenda[0]
                            );
                            dscFinal =
                              prendaEncontrada.precioVenta *
                              resValidCupon.promocion.descuento;
                          }
                        }

                        const cuponActual = {
                          codigoCupon: cupon,
                          codigoPromocion: resValidCupon.promocion.codigo,
                          descripcion: resValidCupon.promocion.descripcion,
                          prenda: resValidCupon.promocion.prenda,
                          alcance: resValidCupon.promocion.alcance,
                          nMultiplicador:
                            resValidCupon.promocion.tipoDescuento ===
                            "Porcentaje"
                              ? resValidCupon.promocion.descuento / 100
                              : resValidCupon.promocion.descuento,
                          descuento: dscFinal,
                          tipoDescuento: resValidCupon.promocion.tipoDescuento,
                          tipoPromocion: resValidCupon.promocion.tipoPromocion,
                        };

                        setListCupones([...listCupones, cuponActual]);
                        changeValue("cargosExtras.beneficios.promociones", [
                          ...values.cargosExtras.beneficios.promociones,
                          cuponActual,
                        ]);

                        alert("¡Se agregó correctamente!");
                        setPortalValiPromocion(false);
                        setResValidCupon(null);
                        setCupon();
                      } else {
                        // Si ya existe un registro con el mismo codigoPromocion, puedes manejarlo como desees
                        alert("¡El registro ya existe!");
                      }
                    }}
                  >
                    Agregar
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </Portal>
      ) : null}
    </div>
  );
};

export default InfoDescuento;
