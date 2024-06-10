/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Autocomplete, Button, Select, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import React from "react";
import { documento } from "../../../../services/global";
import "./infoCliente.scss";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import ValidIco from "../../../ValidIco/ValidIco";
import { useSelector } from "react-redux";

const InfoCliente = ({
  paso,
  descripcion,
  changeValue,
  values,
  iEdit,
  changeICliente,
  iCliente,
  error,
  touched,
}) => {
  const [infoClientes, setInfoClientes] = useState([]);
  const listClientes = useSelector((state) => state.clientes.listClientes);
  const [filterBy, setFilterBy] = useState("nombre");
  const [searchedValue, setSearchedValue] = useState("");
  const [useSavedClients, setUseSavedClients] = useState(false);

  const handleGetClientes = async (value) => {
    const regex = new RegExp(value, "i"); // 'i' para que sea insensible a mayúsculas/minúsculas
    const resultados = listClientes.filter((cliente) =>
      regex.test(cliente[filterBy])
    );
    setInfoClientes(resultados);
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
        {!iEdit ? (
          <div className="tipo-registro-cli">
            <Select
              style={{ width: "135px" }}
              label="Buscar por :"
              value={filterBy}
              onChange={(value) => {
                changeICliente(null);
                setUseSavedClients(false);
                setFilterBy(value);
                changeValue("dni", "");
                changeValue("name", "");
                changeValue("phone", "");
                changeValue("direccion", "");
                setSearchedValue("");
              }}
              data={[
                { value: "nombre", label: "Nombre" },
                { value: "dni", label: documento },
                { value: "phone", label: "Teléfono" },
              ]}
            />
            <Autocomplete
              label=" "
              autoComplete="off"
              onChange={(value) => {
                setSearchedValue(value);
                handleGetClientes(value);
                changeICliente(null);
              }}
              value={searchedValue}
              onItemSubmit={(selected) => {
                const cliente = infoClientes.find(
                  (obj) => obj[filterBy] === selected.value
                );
                setUseSavedClients(true);
                changeICliente(cliente);
                changeValue("dni", cliente?.dni || "");
                changeValue("name", cliente?.nombre || "");
                changeValue("phone", cliente?.phone || "");
                changeValue("direccion", cliente?.direccion || "");
              }}
              data={
                searchedValue
                  ? infoClientes
                      .filter((obj) => obj[filterBy]) // Se asegura de que haya un valor en el campo filterBy
                      .map((obj) => obj[filterBy])
                  : []
              }
            />
            <Button
              className="btn-cancel-filter"
              type="button"
              onClick={() => {
                changeICliente(null);
                setUseSavedClients(false);
                setFilterBy("nombre");
                changeValue("dni", "");
                changeValue("name", "");
                changeValue("phone", "");
                changeValue("direccion", "");
                setSearchedValue("");
              }}
            >
              X
            </Button>
          </div>
        ) : null}
        <hr />
        <div className="input-info-required">
          <TextInput
            name="name"
            label="Nombres :"
            autoComplete="ÑÖcompletes"
            onChange={(e) => {
              const valor = e.target.value;
              changeValue("name", valor);
            }}
            value={values.name}
            readOnly={useSavedClients}
          />
          {error.name && touched.name && ValidIco({ mensaje: error.name })}
        </div>

        <TextInput
          name="direccion"
          className="input-info"
          label="Direccion :"
          autoComplete="ÑÖcompletes"
          onChange={(e) => {
            const valor = e.target.value;
            changeValue("direccion", valor);
          }}
          value={values.direccion}
          readOnly={useSavedClients}
        />
        <TextInput
          name="phone"
          className="input-info"
          label="Celular :"
          autoComplete="ÑÖcompletes"
          onChange={(e) => {
            const valor = e.target.value;
            changeValue("phone", valor);
          }}
          value={values.phone}
          readOnly={useSavedClients}
        />
        <TextInput
          name="dni"
          className="input-info"
          label={`${documento} :`}
          autoComplete="ÑÖcompletes"
          onChange={(e) => {
            const valor = e.target.value;
            changeValue("dni", valor);
          }}
          value={values.dni}
          readOnly={useSavedClients}
        />
      </div>
    </div>
  );
};

export default InfoCliente;
