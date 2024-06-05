/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import "./infoPago.scss";
import ButtonSwitch from "../../MetodoPago/ButtonSwitch/ButtonSwitch";
import { ingresoDigital, simboloMoneda } from "../../../../services/global";

import Tranferencia from "../../../../utils/img/OrdenServicio/Transferencia.png";
import Efectivo from "../../../../utils/img/OrdenServicio/dinero.png";
import Tarjeta from "../../../../utils/img/OrdenServicio/card.png";

const InfoPago = ({
  paso,
  descripcion,
  values,
  iPago,
  isPortalPago,
  setIsPortalPago,
}) => {
  return (
    <div className="info-pago">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        <div className="f-Pay">
          <div className="content-sb">
            <div className="input-pay ">
              <label htmlFor="">Pago :</label>
              <button
                className="btn-switch"
                type="button"
                onClick={() => setIsPortalPago(!isPortalPago)}
              >
                <ButtonSwitch pago={values.pago} />
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
            <div className="estado-pago">{`${iPago.metodoPago} ${simboloMoneda}${iPago.total} : ${values.pago}`}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InfoPago;
