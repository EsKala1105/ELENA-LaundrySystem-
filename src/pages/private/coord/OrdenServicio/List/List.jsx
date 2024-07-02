/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Box, MultiSelect, Textarea, Tooltip } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Portal from "../../../../../components/PRIVATE/Portal/Portal";
import Detalle from "../../../../../utils/img/Otros/detalle.png";
import DetalleM from "../../../../../utils/img/Otros/detalleM.png";
import "./list.scss";

import moment from "moment";
import {
  DateCurrent,
  GetFirstFilter,
  handleGetInfoPago,
  handleOnWaiting,
  handleItemsCantidad,
  formatThousandsSeparator,
} from "../../../../../utils/functions/index";

import { useDispatch, useSelector } from "react-redux";

import { GetOrdenServices_DateRange } from "../../../../../redux/actions/aOrdenServices";
import { GetMetas } from "../../../../../redux/actions/aMetas";
import { setLastRegister } from "../../../../../redux/states/service_order";

import EndProcess from "../Actions/EndProcess/EndProcess";
import Details from "../Details/Details";
import BarProgress from "../../../../../components/PRIVATE/BarProgress/BarProgress";
import { Roles } from "../../../../../models";
import { documento } from "../../../../../services/global";
import { useRef } from "react";

const List = () => {
  //Filtros de Fecha
  const firstFilter = GetFirstFilter(); // Filtro x Mes Actual y anterior
  const [secondFilter, setSecondFilter] = useState(new Date()); // Filtro por Año
  // const [showAnulado, setShowAnulado] = useState("Mostrar"); // Filtrar Anulados
  const [FiltroClientes, setFiltroClientes] = useState(firstFilter.formatoS);
  const [showLeyenda, setShowLeyenda] = useState(false); // Filtrar Anulados

  const dispatch = useDispatch();

  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const { registered } = useSelector((state) => state.orden);

  const [infoRegistrado, setInfoRegistrado] = useState([]);
  const [detailEdit, setDetailEdit] = useState(false);
  const [changePago, setChangePago] = useState(false);

  const [rowPick, setRowPick] = useState();

  const [cPedidos, setCPedidos] = useState();

  const [pressedRow, setPressedRow] = useState();
  const timeoutRowRef = useRef(null);
  const iDelivery = useSelector((state) => state.servicios.serviceDelivery);

  const infoMetas = useSelector((state) => state.metas.infoMetas);

  const columns = useMemo(
    () => [
      {
        accessorKey: "Recibo",
        header: "Orden",
        mantineFilterTextInputProps: {
          placeholder: "N°",
        },
        //enableEditing: false,
        size: 75,
      },
      {
        accessorKey: "Nombre",
        header: "Nombre",
        mantineFilterTextInputProps: {
          placeholder: "Cliente",
        },
        //enableSorting: false,
        size: 100,
      },
      {
        accessorKey: "Modalidad",
        header: "Modalidad",
        //enableSorting: false,
        filterVariant: "select",
        mantineFilterSelectProps: { data: ["TIENDA", "DELIVERY"] },
        mantineFilterTextInputProps: { placeholder: "Modalidad" },
        editVariant: "select",
        mantineEditSelectProps: {
          data: [
            {
              value: "Tienda",
              label: "Tienda",
            },
            {
              value: "Delivery",
              label: "Delivery",
            },
          ],
        },
        enableEditing: false,
        size: 100,
      },
      {
        accessorKey: "FechaRecepcion",
        header: "Recepcion",
        mantineFilterTextInputProps: {
          placeholder: "Fecha",
        },
        size: 100,
      },
      {
        accessorKey: "items",
        header: "Items",
        mantineFilterTextInputProps: {
          placeholder: "Item",
        },
        Cell: ({ cell }) => (
          <MultiSelect
            data={cell.getValue()}
            value={cell.getValue()}
            readOnly
          />
        ),
        size: 250,
      },
      {
        accessorKey: "PParcial",
        header: "Monto Cobrado",
        //enableSorting: false,
        Cell: ({ cell }) => (
          <Box>{formatThousandsSeparator(cell.getValue(), true)}</Box>
        ),
        mantineFilterTextInputProps: {
          placeholder: "Monto",
        },
        size: 130,
      },
      {
        accessorKey: "Pago",
        header: "Pago",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["COMPLETO", "INCOMPLETO", "PENDIENTE"],
        },
        mantineFilterTextInputProps: { placeholder: "C / I / P" },
        editVariant: "select",
        mantineEditSelectProps: {
          data: [
            {
              value: "COMPLETO",
              label: "COMPLETO",
            },
            {
              value: "INCOMPLETO",
              label: "INCOMPLETO",
            },
            {
              value: "PENDIENTE",
              label: "PENDIENTE",
            },
          ],
        },
        enableEditing: false,
        size: 150,
      },
      {
        accessorKey: "totalNeto",
        header: "Total",
        //enableSorting: false,
        Cell: ({ cell }) => (
          <Box>{formatThousandsSeparator(cell.getValue(), true)}</Box>
        ),
        enableEditing: false,
        mantineFilterTextInputProps: {
          placeholder: "Total",
        },
        size: 130,
      },
      {
        accessorKey: "Celular",
        header: "Celular",
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: "Numero",
        },
        size: 80,
      },
      {
        accessorKey: "Direccion",
        header: "Direccion",
        enableColumnFilter: false,
        mantineFilterTextInputProps: {
          placeholder: "Direccion",
        },
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <Textarea
              autosize
              minRows={1}
              maxRows={3}
              readOnly
              value={cell.getValue()}
            />
          ) : (
            ""
          ),
        size: 200,
      },
      {
        accessorKey: "Location",
        header: "Ubicacion",
        //enableSorting: false,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: [
            {
              value: 1,
              label: "Tienda",
            },
            {
              value: 2,
              label: "Almacen",
            },
            {
              value: 3,
              label: "Donacion",
            },
          ],
        },
        mantineFilterTextInputProps: {
          placeholder: "Tienda / Almacen / Donacion",
        },

        Cell: ({ cell }) => (
          // Wrapped the arrow function with parentheses
          <Box
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === 1
                  ? theme.colors.green[9]
                  : cell.getValue() === 2
                  ? theme.colors.red[9]
                  : theme.colors.pink[4],
              borderRadius: "4px",
              color: "#fff",
              textAlign: "center",
              padding: "10px 15px",
            })}
          >
            {cell.getValue() === 1
              ? "Tienda"
              : cell.getValue() === 2
              ? "Almacen"
              : "Donacion"}
          </Box>
        ),
        size: 130,
      },
      {
        accessorKey: "FechaEntrega",
        header: "Fecha Entrega",
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: "Fecha",
        },
        size: 120,
      },
      {
        accessorKey: "DNI",
        header: documento,
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: documento,
        },
        size: 80,
      },
      {
        accessorKey: "onWaiting",
        header: "Orden en Espera...",
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          // Wrapped the arrow function with parentheses
          cell.getValue().stado ? (
            <Box
              sx={(theme) => ({
                backgroundColor: cell.getValue().stadoEntrega
                  ? theme.colors.blue[9]
                  : cell.getValue().nDias < 20
                  ? theme.colors.green[9]
                  : cell.getValue().nDias >= 21 && cell.getValue().nDias <= 30
                  ? theme.colors.yellow[9]
                  : theme.colors.red[9],
                borderRadius: "4px",
                color: "#fff",
                textAlign: "center",
                padding: "10px 15px",
              })}
            >
              {cell.getValue().showText}
            </Box>
          ) : (
            <span>-</span>
          ),
        size: 150,
      },
    ],
    []
  );

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
          Id: d._id,
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

  const handlePlanChange = async (event) => {
    if (event.target.value !== "MESES ANTERIORES") {
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: firstFilter.formatoD[0],
          dateFin: firstFilter.formatoD[1],
        })
      );
    } else {
      const startDate = moment
        .utc(secondFilter)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endDate = moment
        .utc(secondFilter)
        .endOf("month")
        .format("YYYY-MM-DD");
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: startDate,
          dateFin: endDate,
        })
      );
    }

    setFiltroClientes(event.target.value);
  };

  const handleMonthPickerChange = useCallback(
    (date) => {
      const startDate = moment.utc(date).startOf("month").format("YYYY-MM-DD");
      const endDate = moment.utc(date).endOf("month").format("YYYY-MM-DD");
      setSecondFilter(date);
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: startDate,
          dateFin: endDate,
        })
      );
    },
    [dispatch]
  );

  const handleGetTotalPedidos = () => {
    const resultado = {
      Tienda: 0,
      Delivery: 0,
      Total: 0,
    };

    const currentYearMonth = moment().format("YYYY-MM"); // Obtiene el año y mes actual en el formato deseado (sin el día)

    for (const registro of registered) {
      const fechaRegistro = moment(registro.dateRecepcion.fecha).format(
        "YYYY-MM"
      ); // Formatea la fecha del registro en el mismo formato (sin el día)

      if (
        registro.estadoPrenda !== "anulado" &&
        fechaRegistro === currentYearMonth
      ) {
        if (registro.Modalidad === "Tienda") {
          resultado.Tienda++;
        } else if (registro.Modalidad === "Delivery") {
          resultado.Delivery++;
        }
      }
    }
    resultado.Total = resultado.Tienda + resultado.Delivery;

    setCPedidos(resultado);
  };

  const handleGetSizeTexto = (texto) => {
    // Crear un elemento canvas temporal
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Establecer el tamaño de fuente y la fuente
    ctx.font = `16px Arial`;

    // Medir el ancho del texto
    const ancho = ctx.measureText(texto).width;

    return ancho;
  };

  const handleSelectRow = (rowInfo) => {
    if (InfoUsuario.rol !== Roles.PERS) {
      setRowPick(rowInfo);
      if (
        rowInfo.EstadoPrenda === "anulado" ||
        rowInfo.EstadoPrenda === "donado"
      ) {
        setChangePago(false);
      } else if (
        rowInfo.EstadoPrenda === "entregado" &&
        rowInfo.FechaEntrega !== DateCurrent().format4
      ) {
        setChangePago(false);
      } else {
        setChangePago(true);
      }
    }
  };

  const handleTouchEndRow = () => {
    setPressedRow(null);
    clearTimeout(timeoutRowRef.current);
  };

  const handleTouchStartRow = (rowInfo) => {
    setPressedRow(rowInfo?.Id);

    timeoutRowRef.current = setTimeout(() => {
      setPressedRow(null);
      handleSelectRow(rowInfo);
    }, 1500);
  };

  useEffect(() => {
    dispatch(setLastRegister());
  }, []);

  useEffect(() => {
    handleGetFactura(registered);
    handleGetTotalPedidos();
  }, [registered]);

  useEffect(() => {
    if (infoMetas.length === 0) {
      dispatch(GetMetas());
    }
  }, [infoMetas]);

  return (
    <div className="list-pedidos">
      <div className="header-space">
        <div className="filter-date">
          <div
            style={{
              width: `${(handleGetSizeTexto(firstFilter.formatoS) + 40) * 2}px`,
              minWidth: "360px",
            }}
            className="switches-container fecha-s"
          >
            <input
              type="radio"
              id="filtroUno"
              name="switchFC"
              value={firstFilter.formatoS}
              checked={FiltroClientes === firstFilter.formatoS}
              onChange={handlePlanChange}
            />
            <input
              type="radio"
              id="filtroDos"
              name="switchFC"
              value="MESES ANTERIORES"
              checked={FiltroClientes === "MESES ANTERIORES"}
              onChange={handlePlanChange}
            />
            <label htmlFor="filtroUno">{firstFilter.formatoS}</label>
            <label htmlFor="filtroDos">MESES ANTERIORES</label>
            <div className="switch-wrapper">
              <div className="switch">
                <div>{firstFilter.formatoS}</div>
                <div>MESES ANTERIORES</div>
              </div>
            </div>
          </div>
          {FiltroClientes === "MESES ANTERIORES" ? (
            <MonthPickerInput
              className="date-m"
              size="md"
              placeholder="Pick date"
              value={secondFilter}
              onChange={handleMonthPickerChange}
              mx="auto"
              maw={400}
            />
          ) : null}
        </div>
        <Tooltip label="Significados de Colores">
          <button className="btn-leyenda" onClick={() => setShowLeyenda(true)}>
            <i className="fa-solid fa-eye" />
          </button>
        </Tooltip>
      </div>
      <div className="body-pedidos">
        <div className="indicator">
          <BarProgress cantActual={cPedidos?.Total} meta={infoMetas?.Total} />
        </div>
        <MantineReactTable
          columns={columns}
          data={infoRegistrado}
          initialState={{
            showColumnFilters: true,
            density: "xs",
            sorting: [{ id: "Recibo", desc: true }],
            pagination: { pageSize: 5 },
          }}
          enableToolbarInternalActions={false}
          enableHiding={false}
          filterFns={{
            customFilterFn: (row, id, filterValue) => {
              return row.getValue(id) === filterValue;
            },
          }}
          localization={{
            filterCustomFilterFn: "Custom Filter Fn",
          }}
          enableColumnActions={false}
          enableSorting={false}
          enableTopToolbar={false}
          mantineTableProps={{
            highlightOnHover: false,
          }}
          mantineTableBodyCellProps={() => ({
            sx: {
              background: "transparent",
            },
          })}
          mantineTableBodyRowProps={({ row }) => ({
            onDoubleClick: () => handleSelectRow(row.original),
            onTouchStart: () => handleTouchStartRow(row.original),
            onTouchMove: () => handleTouchEndRow(),
            onTouchEnd: () => handleTouchEndRow(),

            sx: {
              backgroundColor:
                row.original.EstadoPrenda === "entregado"
                  ? "#77f9954d"
                  : row.original.EstadoPrenda === "anulado"
                  ? "#f856564d"
                  : row.original.EstadoPrenda === "donado"
                  ? "#f377f94d"
                  : "",
              border:
                pressedRow === row.original.Id ? "2px solid #6582ff" : "none",
              // userSelect: "none",
            },
          })}
          enableStickyHeader={true}
          mantineTableContainerProps={{
            sx: {
              // maxHeight: " clamp(370px, calc(100vh - 56px), 370px)",
              maxHeight: "100vh",
              zIndex: "2",
            },
          }}
          enableRowVirtualization={true} // no scroll lateral
          enableRowActions={true}
          //enableRowNumbers
          renderRowActions={({ row }) => (
            <img
              className="ico-detail"
              src={row.original.Notas?.length > 0 ? DetalleM : Detalle}
              alt="detalle"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setRowPick(row.original);
                setDetailEdit(true);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setRowPick(row.original);
                setDetailEdit(true);
              }}
            />
          )}
        />
      </div>
      {detailEdit && (
        <Portal
          onClose={() => {
            setDetailEdit(false);
          }}
        >
          <Details IdCliente={rowPick.Id} />
        </Portal>
      )}
      {changePago && (
        <Portal
          onClose={() => {
            setChangePago(false);
          }}
        >
          <EndProcess IdCliente={rowPick.Id} onClose={setChangePago} />
        </Portal>
      )}
      {showLeyenda && (
        <Portal
          onClose={() => {
            setShowLeyenda(false);
          }}
        >
          <div className="leyenda">
            <div className="cont-ley">
              <span>Leyenda de Filas</span>
              <ul>
                <li>
                  <div className="color f1" />
                  <span>Entregado</span>
                </li>
                <li>
                  <div className="color f2" />
                  <span>Anulado</span>
                </li>
                <li>
                  <div className="color f3" />
                  <span>No Entregado</span>
                </li>
                <li>
                  <div className="color f4" />
                  <span>Donado</span>
                </li>
              </ul>
            </div>
            <div className="cont-ley">
              <span>Leyenda de la columna "Orden en Espera"</span>
              <ul>
                <li>
                  <div className="color a1" />
                  <span>Iniciado</span>
                </li>
                <li>
                  <div className="color a2" />
                  <span>Finalizado</span>
                </li>
                <li>
                  <div className="color a3" />
                  <span>Mayor a 21 dias</span>
                </li>
                <li>
                  <div className="color a4" />
                  <span>Mayor a 1 mes </span>
                </li>
              </ul>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default List;
