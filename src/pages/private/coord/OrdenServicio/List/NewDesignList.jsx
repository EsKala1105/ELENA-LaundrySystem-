/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator.min.css"; // theme
import { ReactTabulator } from "react-tabulator"; //
import "./newDesignList.scss";
import { useState } from "react";
import {
  handleGetInfoPago,
  handleItemsCantidad,
  handleOnWaiting,
} from "../../../../../utils/functions";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { documento } from "../../../../../services/global";
import { useRef } from "react";

const NewDesignList = () => {
  const [idRowSelected, setIdRowSelected] = useState("");
  const ref = useRef();

  const [infoRegistrado, setInfoRegistrado] = useState([]);

  const { registered } = useSelector((state) => state.orden);
  const iDelivery = useSelector((state) => state.servicios.serviceDelivery);

  const printIcon = function (cell, formatterParams) {
    //plain text value
    return "<i class='fa fa-print'></i>";
  };

  const columns = [
    {
      formatter: "responsiveCollapse",
      headerSort: false,
    },
    {
      formatter: printIcon,
      width: 40,
      hozAlign: "center",
      cellClick: function (e, cell) {
        alert("Printing row data for: " + cell.getRow().getData().name);
      },
    },
    {
      title: "Orden",
      field: "Recibo",
      width: 70,
      headerHozAlign: "center",
      // formatter: (cell) => {
      //   return cell.getValue();
      // },
      // formatter: reactFormatter(<SimpleButton />),
      // headerFilter: "input",
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Nombre",
      field: "Nombre",
      headerHozAlign: "center",
      width: 180,
      hozAlign: "left",
      // headerSort: false,
    },
    {
      title: "Modalidad",
      field: "Modalidad",
      headerHozAlign: "center",
      width: 90,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "items",
      field: "items",
      headerHozAlign: "center",
      width: 200,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Monto Cobrado",
      field: "PParcial",
      headerHozAlign: "center",
      width: 160,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Pago",
      field: "Pago",
      headerHozAlign: "center",
      width: 160,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Total",
      field: "totalNeto",
      headerHozAlign: "center",
      width: 200,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Celular",
      field: "Celular",
      headerHozAlign: "center",
      width: 200,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Direccion",
      field: "Direccion",
      headerHozAlign: "center",
      width: 100,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "Ubicacion",
      field: "Location",
      headerHozAlign: "center",
      width: 100,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: documento,
      field: "DNI",
      headerHozAlign: "center",
      width: 100,
      hozAlign: "center",
      // headerSort: false,
    },
    {
      title: "onWaiting",
      field: "onWaiting",
      headerHozAlign: "center",
      width: 100,
      hozAlign: "center",
      // headerSort: false,
    },
  ];

  const handleRowClick = (e, row) => {
    const isSelected = row.getElement().classList.contains("on-selected");

    // Remueve la clase "on-selected" de todas las filas
    const listOrders = document.getElementById("list-orders");
    const tabulatorRows = listOrders.querySelectorAll(".tabulator-row");
    tabulatorRows.forEach((tabulatorRow) => {
      tabulatorRow.classList.remove("on-selected");
    });

    // Agrega o remueve la clase "on-selected" según sea necesario
    if (!isSelected) {
      row.getElement().classList.add("on-selected");
    }
  };
  const handleGetFactura = async (info) => {
    const reOrdenar = [...info].sort((a, b) => b.index - a.index);
    const newData = await Promise.all(
      reOrdenar.map(async (d) => {
        const dateEndProcess =
          d.estadoPrenda === "donado"
            ? d.donationDate.fecha
            : d.dateEntrega.fecha;

        const onWaiting = await handleOnWaiting(
          d.dateRecepcion.fecha,
          d.estadoPrenda,
          dateEndProcess
        );

        const listItems = d.Items.filter(
          (item) => item.identificador !== iDelivery?._id
        );
        const estadoPago = handleGetInfoPago(d.ListPago, d.totalNeto);

        const structureData = {
          id: d._id,
          Recibo: String(d.codRecibo).padStart(4, "0"),
          Nombre: d.Nombre,
          Modalidad: d.Modalidad,
          items: handleItemsCantidad(listItems),
          PParcial: estadoPago.pago,
          Pago: estadoPago.estado,
          totalNeto: d.totalNeto,
          DNI: d.dni,
          Celular: d.celular,
          Direccion: d.direccion,
          FechaEntrega: d.dateEntrega.fecha,
          FechaRecepcion: d.dateRecepcion.fecha,
          Descuento: d.descuento,
          Location: d.location,
          EstadoPrenda: d.estadoPrenda,
          Estado: d.estado,
          Notas: d.notas,
          onWaiting: onWaiting,
        };

        return structureData;
      })
    );

    setInfoRegistrado(newData);
  };

  useEffect(() => {
    handleGetFactura(registered);
  }, [registered]);

  useEffect(() => {
    console.log(idRowSelected);
  }, [idRowSelected]);

  return (
    <div className="table-list">
      <ReactTabulator
        id="list-orders"
        onRef={ref}
        data={infoRegistrado}
        columns={columns}
        height={"max-content"}
        events={{
          rowDblClick: handleRowClick,
        }}
        options={{
          layout: "fitDataFill",
          responsiveLayout: "collapse",
          tooltips: true,
          tooltipsHeader: true,
          responsiveLayoutCollapseStartOpen: false,
        }}
      />
    </div>
  );
};

export default NewDesignList;
