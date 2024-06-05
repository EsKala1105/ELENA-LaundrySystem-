/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import "./infoPromociones.scss";
import { TextInput } from "@mantine/core";
import { formatThousandsSeparator } from "../../../../utils/functions";

const InfoPromociones = ({ listCupones, changeValue, setListCupones }) => {
  return (
    <div className="info-promocion">
      <div className="head-title">
        <h1>Promociones en Uso</h1>
      </div>
      <hr />
      <div className="list-promociones">
        {listCupones.length > 0 ? (
          <>
            {listCupones.map((cupon, index) => (
              <div className="card-promo" key={index}>
                <button
                  className="delete-promo"
                  type="button"
                  onClick={() => {
                    const updatedCupones = [...listCupones];
                    updatedCupones.splice(index, 1);
                    setListCupones(updatedCupones);
                    const sumarDescuentos = updatedCupones.reduce(
                      (total, cupon) => total + cupon.descuento,
                      0
                    );
                    changeValue(
                      "cargosExtras.descuentos.promocion",
                      sumarDescuentos
                    );
                    changeValue(
                      "cargosExtras.beneficios.promociones",
                      updatedCupones
                    );
                  }}
                >
                  X
                </button>
                <span>Promocion :</span>
                <p>{cupon.descripcion}</p>
                <div className="extra-info">
                  <TextInput
                    className="input-info"
                    label="Codigo :"
                    value={cupon.codigoCupon}
                    readOnly
                  />
                  <TextInput
                    className="input-info"
                    label="Descuento :"
                    value={formatThousandsSeparator(cupon.descuento)}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>
      <hr />
      <div className="footer-promo">
        <div className="total-point">
          <label htmlFor="">Total de Descuento</label>
          <span>
            {formatThousandsSeparator(
              listCupones.reduce((total, cupon) => total + cupon.descuento, 0),
              true
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoPromociones;
