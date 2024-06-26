/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { TextInput } from "@mantine/core";
import React from "react";
import styled from "styled-components";
import { ingresoDigital } from "../../../../../services/global";
import { formatThousandsSeparator } from "../../../../../utils/functions";

const InfoCuadreStyle = styled.div`
  display: grid;
  grid-template-rows: 305px auto;
  padding: 20px 10%;
  gap: 30px;
  .form-ic {
    max-width: 300px;
    display: grid;
    gap: 10px;
  }

  .response-ic {
    .bloques-states {
      margin: 25px 0;
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 10px;

      .sb {
        background: #afffa8;
      }

      .cd {
        background: #f9ffa8;
      }

      .fl {
        background: #ffa8a8;
      }

      .states {
        width: max-content;
        text-align: center;
        color: #6c757d;
        font-weight: bold;
        display: grid;
        grid-template-columns: 125px max-content;

        .bloque {
          padding: 10px 20px;
          line-height: 2;
        }

        .title {
          border: solid 1px silver;
          border-radius: 15px 1px 1px 15px;
          border-right: none;
        }

        .res {
          border: solid 1px silver;
          border-radius: 1px 15px 15px 1px;
          border-left: solid 0.5px silver;
          min-width: 125px;
        }
      }
    }
  }
`;

const InfoCuadre = ({
  cajaInicial,
  gastos,
  pedidosPagadosEfectivo,
  pedidosPagadosTransferencia,
  pagosByTipoTransferencia,
  pedidosPagadosTarjeta,
  montoPrevisto,
  stateCuadre,
}) => {
  return (
    <InfoCuadreStyle>
      <div className="form-ic">
        <TextInput
          label="Caja Inicial"
          radius="md"
          value={formatThousandsSeparator(cajaInicial)}
          readOnly
        />
        <TextInput
          label="Pedidos Pagados (EFECTIVO)"
          radius="md"
          value={formatThousandsSeparator(pedidosPagadosEfectivo)}
          readOnly
        />

        <TextInput
          label="Gastos"
          radius="md"
          value={formatThousandsSeparator(gastos)}
          readOnly
        />

        <TextInput
          label="En caja deberia haber :"
          radius="md"
          id="m-previsto"
          value={formatThousandsSeparator(montoPrevisto)}
          readOnly
        />
      </div>
      <div className="response-ic">
        <div className="bloques-states">
          <div className="states">
            <div className="bloque title sb">SOBRA</div>
            <div className="bloque res">
              {Number(stateCuadre) > 0
                ? formatThousandsSeparator(stateCuadre, true)
                : "NO"}
            </div>
          </div>
          <div className="states ">
            <div className="bloque title cd">CUADRA</div>
            <div className="bloque res">
              {Number(stateCuadre) === 0 ? "SI" : "NO"}
            </div>
          </div>
          <div className="states ">
            <div className="bloque title fl">FALTA</div>
            <div className="bloque res">
              {Number(stateCuadre) < 0
                ? formatThousandsSeparator(stateCuadre, true)
                : "NO"}
            </div>
          </div>
        </div>
        {ingresoDigital.map(
          (metodo) =>
            (metodo !== "YAPE o PLIN" ||
              pagosByTipoTransferencia[metodo] !== "0.00") && (
              <TextInput
                key={metodo}
                label={`Pedidos Pagados (${metodo}):`}
                radius="md"
                value={pagosByTipoTransferencia[metodo]}
                readOnly
              />
            )
        )}
        <TextInput
          label={`Pedidos Pagados (TARJETA) :`}
          radius="md"
          value={formatThousandsSeparator(pedidosPagadosTarjeta)}
          readOnly
        />
      </div>
    </InfoCuadreStyle>
  );
};

export default InfoCuadre;
