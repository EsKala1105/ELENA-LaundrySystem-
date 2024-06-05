/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import "./infoFactura.scss";
import SwtichDimension from "../../../SwitchDimension/SwitchDimension";
import { DateCurrent } from "../../../../utils/functions";
const InfoFactura = ({ paso, descripcion, changeValue, values, iEdit }) => {
  return (
    <div className="info-descuento">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        <div className="input-switch">
          <SwtichDimension
            onSwitch="SI"
            offSwitch="NO"
            name="sw-tipo-factura"
            defaultValue={values.factura}
            handleChange={(value) => {
              changeValue("factura", value === "SI" ? true : false);
            }}
            colorOn="#72c999"
            // colorOff=""
            disabled={
              !iEdit ||
              iEdit.dateRecepcion.fecha === DateCurrent().format4 ||
              iEdit?.estado === "reservado"
                ? false
                : true
            }
          />
        </div>
      </div>
    </div>
  );
};

export default InfoFactura;
