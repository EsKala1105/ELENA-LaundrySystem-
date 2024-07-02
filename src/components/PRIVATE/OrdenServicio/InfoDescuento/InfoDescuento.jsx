/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import "./infoDescuento.scss";
import SwtichDimension from "../../../SwitchDimension/SwitchDimension";
import { Button, TextInput } from "@mantine/core";
import Portal from "../../Portal/Portal";
import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const InfoDescuento = ({
  paso,
  descripcion,
  changeValue,
  values,
  iCliente,
  validCupon,
  setListCupones,
  listCupones,
  onDescuento,
  setOnDescuento,
}) => {
  const [codigoCupon, setCodigoCupon] = useState();
  const [infoCupon, setInfoCupon] = useState(null);

  const [PortalValidPromocion, setPortalValiPromocion] = useState(false);

  const iServicios = useSelector((state) => state.servicios.listServicios);

  const handleGetOpcionDescuento = (estado) => {
    if (estado === "SI") {
      setOnDescuento(true);
      changeValue("modoDescuento", "Promocion");
    } else {
      setOnDescuento(false);
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
    setListCupones([]);
    setOnDescuento(false);
    changeValue("modoDescuento", "Promocion");
  };

  return (
    <div className="info-descuento">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        {onDescuento ? (
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
              />
            </div>
          </>
        ) : null}
        {onDescuento === false ? (
          <div className="input-switch">
            <SwtichDimension
              onSwitch="SI"
              offSwitch="NO"
              name="sw-stado-descuento"
              defaultValue={onDescuento}
              handleChange={handleGetOpcionDescuento}
            />
          </div>
        ) : null}
        {values.modoDescuento === "Promocion" && onDescuento ? (
          <Button
            type="button"
            className="btn-promocion"
            onClick={() => {
              setPortalValiPromocion(true);
              setInfoCupon(null);
              setCodigoCupon();
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
                setCodigoCupon(e.target.value);
                setInfoCupon(null);
              }}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn-valid"
              onClick={async () => {
                const infoValidacion = await validCupon(codigoCupon);
                setInfoCupon(infoValidacion);
              }}
            >
              Validar
            </button>
            {infoCupon ? (
              <>
                <textarea
                  style={
                    infoCupon?.validacion === true
                      ? { borderColor: "#00e676" }
                      : { borderColor: "#f5532f" }
                  }
                  className="description-info"
                  value={
                    infoCupon?.validacion === true
                      ? infoCupon?.promocion.descripcion
                      : infoCupon?.respuesta
                  }
                  readOnly
                />
                {infoCupon?.validacion === true ? (
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => {
                      // Buscar si ya existe un registro en la lista
                      const exists = listCupones.some(
                        (c) => c.codigoCupon === codigoCupon
                      );
                      if (!exists) {
                        let dscFinal = 0;
                        if (infoCupon.promocion.tipoPromocion === "Varios") {
                          if (
                            infoCupon.promocion.tipoDescuento === "Porcentaje"
                          ) {
                            dscFinal = 0;
                          } else {
                            dscFinal = infoCupon.promocion.descuento;
                          }
                        } else {
                          // tipoPromocion es Unico
                          if (
                            infoCupon.promocion.tipoDescuento === "Gratis" &&
                            infoCupon.promocion.tipoPromocion === "Unico"
                          ) {
                            const prendaEncontrada = iServicios.find(
                              (p) => p._id === infoCupon.promocion.prenda[0]
                            );
                            dscFinal =
                              prendaEncontrada.precioVenta *
                              infoCupon.promocion.descuento;
                          }
                        }

                        const cuponActual = {
                          cantidadMin: infoCupon.promocion.cantidadMin,
                          codigoCupon: codigoCupon,
                          codigoPromocion: infoCupon.promocion.codigo,
                          descripcion: infoCupon.promocion.descripcion,
                          prenda: infoCupon.promocion.prenda,
                          alcance: infoCupon.promocion.alcance,
                          nMultiplicador:
                            infoCupon.promocion.tipoDescuento === "Porcentaje"
                              ? infoCupon.promocion.descuento / 100
                              : infoCupon.promocion.descuento,
                          descuento: dscFinal,
                          tipoDescuento: infoCupon.promocion.tipoDescuento,
                          tipoPromocion: infoCupon.promocion.tipoPromocion,
                        };

                        setListCupones([...listCupones, cuponActual]);
                        changeValue("cargosExtras.beneficios.promociones", [
                          ...values.cargosExtras.beneficios.promociones,
                          cuponActual,
                        ]);

                        alert("¡Se agregó correctamente!");
                        setPortalValiPromocion(false);
                        setInfoCupon(null);
                        setCodigoCupon();
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
