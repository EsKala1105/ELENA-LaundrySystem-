/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Autocomplete, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import React from "react";
import { documento } from "../../../../services/global";
import "./infoCliente.scss";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import ValidIco from "../../../ValidIco/ValidIco";

const InfoCliente = ({
  paso,
  descripcion,
  changeValue,
  values,
  iEdit,
  changeICliente,
  error,
  touched,
}) => {
  const [infoClientes, setInfoClientes] = useState([]);

  const handleGetClientes = async (numberDocument) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/get-clientes/${numberDocument}`
      );
      const data = response.data;
      setInfoClientes(data);
      return data;
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
    }
  };

  useEffect(() => {
    changeValue("modoDescuento", "Promocion");
  }, [values.dni]);

  return (
    <div className="info-cliente">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        <DateInput
          className="input-info"
          label="Fecha de Ingreso"
          name="dateRecojo"
          value={values.dateRecojo}
          onChange={(date) => {
            changeValue("dateRecojo", date);
          }}
          style={{ paddingBottom: "8px" }}
          readOnly
        />
        <hr />
        <Autocomplete
          className="input-info"
          name="dni"
          onChange={(dni) => {
            handleGetClientes(dni);
            changeValue("dni", dni);
            changeICliente(null);
          }}
          autoFocus
          label={`${documento} :`}
          placeholder={`Ingrese ${documento}`}
          value={values.dni}
          onItemSubmit={(selected) => {
            const cliente = infoClientes.find(
              (obj) => obj.dni === selected.value
            );
            changeICliente(cliente);
            changeValue("name", cliente.nombre);
            changeValue("phone", cliente.phone);
            changeValue("direccion", cliente.direccion);
          }}
          autoComplete="off"
          data={
            infoClientes.length > 0 ? infoClientes.map((obj) => obj.dni) : []
          }
          disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
        />
        <div className="input-info-required">
          <TextInput
            name="name"
            label="Nombres :"
            autoComplete="off"
            onChange={(e) => {
              const valor = e.target.value;
              changeValue("name", valor);
            }}
            value={values.name}
          />
          {error.name && touched.name && ValidIco({ mensaje: error.name })}
        </div>

        <TextInput
          name="direccion"
          className="input-info"
          label="Direccion :"
          autoComplete="off"
          onChange={(e) => {
            const valor = e.target.value;
            changeValue("direccion", valor);
          }}
          value={values.direccion}
        />
        <TextInput
          name="phone"
          className="input-info"
          label="Celular :"
          autoComplete="off"
          onChange={(e) => {
            const valor = e.target.value;
            changeValue("phone", valor);
          }}
          value={values.phone}
        />
      </div>
    </div>
  );
};

export default InfoCliente;
