/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import "./infoFactura.scss";
import SwtichDimension from "../../../SwitchDimension/SwitchDimension";
const InfoFactura = ({ mode, paso, descripcion, changeValue, values }) => {
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
            disabled={mode === "UPDATE"}
          />
        </div>
      </div>
    </div>
  );
};

export default InfoFactura;
