/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import "./metodoPago.scss";
import * as Yup from "yup";
import { ingresoDigital } from "../../../services/global";
import { Button, NumberInput } from "@mantine/core";
import { useFormik } from "formik";
import { formatThousandsSeparator } from "../../../utils/functions";

const MetodoPago = ({
  handlePago,
  infoPago,
  totalToPay,
  handleNoPagar,
  onClose,
  modeUse,
}) => {
  const validationSchema = Yup.object().shape({
    metodoPago: Yup.string().required("Campo obligatorio"),
    total: Yup.string().required("Campo obligatorio"),
  });

  const formMetodoPago = useFormik({
    initialValues: {
      metodoPago: infoPago?.metodoPago,
      total: infoPago ? infoPago.total : +totalToPay === 0 ? 0 : "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handlePagar(values);
    },
  });

  const handlePagar = (info) => {
    if (totalToPay > 0) {
      if (info.total <= 0) {
        if (modeUse === "Edit") {
          handleNoPagar(infoPago._id);
        } else {
          handleNoPagar();
        }
      } else {
        handlePago({
          ...infoPago,
          metodoPago: info.metodoPago,
          total: info.total,
        });
      }
    } else {
      handlePago({
        ...infoPago,
        metodoPago: info.metodoPago,
        total: 0,
      });
    }
    onClose(false);
  };

  const handleOptionChange = (event) => {
    const mPago = event.target.value;
    formMetodoPago.setFieldValue("metodoPago", mPago);
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

  return (
    <form onSubmit={formMetodoPago.handleSubmit} className="content-metdo-pago">
      <fieldset className="checkbox-group">
        <legend className="checkbox-group-legend">Escoja Metodo de Pago</legend>
        <div className="checkbox">
          <label className="checkbox-wrapper">
            <input
              type="radio"
              className="checkbox-input"
              name="metodoPago"
              value="Efectivo"
              checked={formMetodoPago.values.metodoPago === "Efectivo"}
              onChange={(e) => handleOptionChange(e)}
            />
            <span className="checkbox-tile">
              <span className="checkbox-icon">
                {/* <Taxi className="custom-icon" /> */}
              </span>
              <span className="checkbox-label">Efectivo</span>
            </span>
          </label>
        </div>
        <div className="checkbox">
          <label className="checkbox-wrapper">
            <input
              type="radio"
              className="checkbox-input"
              name="metodoPago"
              value={ingresoDigital}
              checked={formMetodoPago.values.metodoPago === ingresoDigital}
              onChange={(e) => handleOptionChange(e)}
            />
            <span className="checkbox-tile">
              <span className="checkbox-icon">
                {/* <Moto className="custom-icon" /> */}
              </span>
              <span className="checkbox-label">
                {ingresoDigital.charAt(0) +
                  ingresoDigital.slice(1).toLowerCase()}
              </span>
            </span>
          </label>
        </div>
        <div className="checkbox">
          <label className="checkbox-wrapper">
            <input
              type="radio"
              className="checkbox-input"
              name="metodoPago"
              value="Tarjeta"
              checked={formMetodoPago.values.metodoPago === "Tarjeta"}
              onChange={(e) => handleOptionChange(e)}
            />
            <span className="checkbox-tile">
              <span className="checkbox-icon">
                {/* <Moto className="custom-icon" /> */}
              </span>
              <span className="checkbox-label">Tarjeta</span>
            </span>
          </label>
        </div>
        {formMetodoPago.errors.metodoPago &&
          formMetodoPago.touched.metodoPago &&
          validIco(formMetodoPago.errors.metodoPago)}
      </fieldset>
      <div className="info-pay">
        <div className="input-monto">
          <NumberInput
            name="total"
            className="montoToPay"
            label={`Monto de Pago : Max(${formatThousandsSeparator(
              totalToPay
            )})`}
            placeholder="Ingrese Monto"
            precision={2}
            value={formMetodoPago.values.total}
            formatter={(value) => formatThousandsSeparator(value)}
            onChange={(value) => formMetodoPago.setFieldValue("total", value)}
            min={0}
            step={1}
            max={+totalToPay}
            hideControls
            autoComplete="off"
          />
          {formMetodoPago.errors.total &&
            formMetodoPago.touched.total &&
            validIco(formMetodoPago.errors.total)}
        </div>

        <div className="action">
          <Button
            type="submit"
            className="btn-save"
            variant="gradient"
            gradient={
              infoPago
                ? { from: "#11998e", to: "#38ef7d" }
                : { from: "indigo", to: "cyan" }
            }
          >
            {totalToPay === 0 ? "Guardar" : infoPago ? "Cambiar" : "Guardar"}
          </Button>

          {infoPago ? (
            <Button
              type="button"
              onClick={() => {
                if (modeUse === "Edit") {
                  handleNoPagar(infoPago._id);
                } else {
                  handleNoPagar();
                }
                onClose(false);
              }}
              className="btn-save"
              variant="gradient"
              gradient={{ from: "#ED213A", to: "#93291E" }}
            >
              No Pagar
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default MetodoPago;
