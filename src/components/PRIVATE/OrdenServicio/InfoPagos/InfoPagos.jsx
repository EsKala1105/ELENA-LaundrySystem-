/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import "./infoPagos.scss";
import moment from "moment";
import { DateCurrent } from "../../../../utils/functions";

const InfoPagos = ({
  descripcion,
  handleNoPagar,
  listPago,
  setIPago,
  isPortalPago,
  setIsPortalPago,
  iUsuario,
}) => {
  return (
    <div className="info-pagos">
      <div className="title">
        <h1>{descripcion}</h1>
      </div>
      <div className="body">
        {listPago.length > 0 ? (
          listPago.map((pago, index) => (
            <div className="card-pago" key={index}>
              {pago.idUser === iUsuario._id &&
              ((pago.isCounted === false &&
                DateCurrent().format4 === pago.ordenDateCreation) ||
                DateCurrent().format4 === pago.date.fecha) ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIPago(pago);
                      setIsPortalPago(!isPortalPago);
                    }}
                    className="btn-action btn-edit"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleNoPagar(pago._id);
                    }}
                    className="btn-action btn-delete"
                  >
                    <i className="fa-solid fa-delete-left"></i>
                  </button>
                </>
              ) : null}
              {pago.isCounted === false ? (
                <span className="sn-sm">PAGO ANTIGUO</span>
              ) : null}

              <div className="mm-pago">
                <div className="monto-p">{pago.total}</div>
                <span className="metodo-p">{pago.metodoPago}</span>
              </div>
              <hr />
              <div className="date-p">
                {moment(pago.date.fecha).format("dddd DD [de] MMMM [del] YYYY")}
              </div>
            </div>
          ))
        ) : (
          <span>NINGUNO (PAGO PENDIENTE)</span>
        )}
      </div>
    </div>
  );
};

export default InfoPagos;
