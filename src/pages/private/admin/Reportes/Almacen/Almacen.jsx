/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollArea, Text, Textarea } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import axios from "axios";

import "./almacen.scss";

import { modals } from "@mantine/modals";
import ExcelJS from "exceljs";
import { useDisclosure } from "@mantine/hooks";
import { Box, MultiSelect } from "@mantine/core";
import { List, ThemeIcon } from "@mantine/core";
import imgDetalle from "../../../../../utils/img/Otros/detalle2.png";
import {
  handleGetInfoPago,
  handleItemsCantidad,
  handleOnWaiting,
} from "../../../../../utils/functions";

import Detalle from "../Detalle/Detalle";
import { handleRemoveFStorage } from "../../../../../services/default.services";
import { Notify } from "../../../../../utils/notify/Notify";
import { socket } from "../../../../../utils/socket/connect";
import { useDispatch, useSelector } from "react-redux";
import { LS_updateListOrder } from "../../../../../redux/states/service_order";
import { simboloMoneda } from "../../../../../services/global";

const Almacen = () => {
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState([]);
  const [orderSelection, setOrderSelection] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [inDonation, setInDonation] = useState([]);
  const [infoAlmacenados, setInfoAlmacenados] = useState([]);
  const dispatch = useDispatch();
  const [onModal, setOnModal] = useState("");
  const [onDetail, setOnDetail] = useState();

  const iDelivery = useSelector((state) => state.servicios.serviceDelivery);

  const handleGetAlmacenados = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/get-warehouse-service-order`
      );
      if (response) {
        const info = response.data;

        setInfoAlmacenados(handleGetFactura(info));
      }
    } catch (error) {
      console.log(error.response.data.mensaje);
      Notify(
        "Error",
        "No se pudo obtener lista de ordenes almacenados",
        "fail"
      );
    }
  };

  const exportToExcel = async () => {
    const fileName = `Lista Almacenados`;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    // Estilos para el encabezado
    const headerStyle = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "333333" }, // Color de fondo para la cabecera (gris oscuro)
      },
      font: {
        color: { argb: "FFFFFF" }, // Color del texto en la cabecera (blanco)
        bold: true, // Texto en negrita
      },
    };

    // Agregar la cabecera
    worksheet
      .addRow([
        "N° Orden",
        "Nombre",
        "Modalidad",
        "Monto Cobrado",
        "Pago",
        "Monto Facturado",
        "Items",
        "Celular",
        "Direccion",
        "En Espera",
        "Fecha de Ingreso",
      ])
      .eachCell((cell) => {
        cell.fill = headerStyle.fill;
        cell.font = headerStyle.font;
      });
    infoAlmacenados.forEach((item) => {
      //const quantitiesText = item.cantidad.join('\n');
      const itemsText = Array.from(item.items).join("\n");
      const estadoPago = handleGetInfoPago(item.ListPago, item.totalNeto);

      worksheet.addRow([
        item.Recibo,
        item.Nombre,
        item.Modalidad,
        estadoPago.pago > 0 ? +estadoPago.pago : 0,
        estadoPago.estado,
        +item.totalNeto,
        itemsText,
        item.Celular ? item.Celular : "-",
        item.Direccion ? item.Direccion : "-",
        item.onWaiting.showText,
        item.FechaIngreso.fecha,
      ]);
    });

    const itemsColumn = worksheet.getColumn(7);

    worksheet.eachRow((row) => {
      row.alignment = {
        wrapText: true,
        horizontal: "center",
        vertical: "middle",
      };
    });

    // Ajustar automáticamente el ancho de las columnas excepto "Products" basado en el contenido
    let maxLengthColumns = 0;
    await worksheet.columns.forEach((column) => {
      if (column !== itemsColumn) {
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          maxLengthColumns = Math.max(maxLengthColumns, cellLength);
        });
        column.width = maxLengthColumns + 2; // Agrega un espacio adicional
      }
    });

    const maxLineLengths = [];
    await worksheet.eachRow({ includeEmpty: true }, (row) => {
      const cell = row.getCell(7); // Obtener la celda de la columna "Products"
      const lines = cell.text.split("\n");
      let maxLength = 0;
      lines.forEach((line) => {
        const lineLength = line.length;
        maxLength = Math.max(maxLength, lineLength);
      });
      maxLineLengths.push(maxLength);
    });

    const maxLength = Math.max(...maxLineLengths);
    itemsColumn.width = maxLength + 4;

    // Aplicar autofiltro a todas las columnas y filas
    const totalRows = worksheet.rowCount;
    const totalColumns = worksheet.columnCount;

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: totalRows, column: totalColumns },
    };

    const HeaderItems = worksheet.getCell("G1");

    itemsColumn.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
      indent: 1,
    };
    HeaderItems.alignment = { horizontal: "center", vertical: "middle" };

    // Guardar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".xlsx";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (!loading) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        exportToExcel();
      }, 2400);
    }
  };

  const handleDonarAlmacenados = async (Ids) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-to-donation`,
        { Ids }
      );

      const res = response.data;
      dispatch(LS_updateListOrder(res));
      socket.emit("client:updateListOrder", res);

      return res;
    } catch (error) {
      console.log(error.response.data.mensaje);
      throw new Error(error);
    }
  };

  const handleDonar = async () => {
    const Ids = orderSelection.map((element) => element._id);

    await handleDonarAlmacenados(Ids)
      .then((res) => {
        const updatedInfoAlmacenados = infoAlmacenados.filter(
          (p) => !Ids.includes(p._id)
        );

        setInfoAlmacenados(updatedInfoAlmacenados);
        setInDonation(res);
        setRowSelection([]);
        setOrderSelection([]);
        setOnModal("Donados");
        open();
      })
      .catch(() => {
        Notify("Error", "No se pudo enviar a donacion", "fail");
      });
  };

  const openConfirmacion = async () => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: "Donacion",
      centered: true,
      children: (
        <Text size="sm">
          ¿Estás seguro de Donar{" "}
          {orderSelection.length === 1
            ? "la fila seleccionada"
            : `las ${orderSelection.length} filas seleccionadas`}{" "}
          ?
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleDonar();
        }
      },
    });
  };

  const handleGetFactura = (info) => {
    const transformData = (info) => {
      const listItems = info.Items.filter(
        (item) => item.identificador !== iDelivery._id
      );

      const estadoPago = handleGetInfoPago(info.ListPago, info.totalNeto);

      return {
        _id: info._id,
        Recibo: String(info.codRecibo).padStart(4, "0"),
        Nombre: info.Nombre,
        Modalidad: info.Modalidad,
        items: handleItemsCantidad(listItems),
        DetalleOrden: info.Items,
        attendedBy: info.attendedBy,
        totalNeto: info.totalNeto,
        Celular: info.celular,
        Direccion: info.direccion ? info.direccion : "- SIN INFORMACION -",
        Pago: estadoPago.estado,
        ListPago: info.ListPago,
        FechaPago: info.datePago,
        FechaIngreso: info.dateRecepcion,
        FechaPrevista: info.datePrevista,
        FechaAlmacenamiento: info.dateStorage,
        Factura: info.factura,
        CargosExtras: info.cargosExtras,
        Descuento: info.descuento,
        onWaiting: handleOnWaiting(
          info.dateRecepcion.fecha,
          info.estadoPrenda,
          info.dateEntrega.fecha
        ),
      };
    };

    if (Array.isArray(info)) {
      // If info is an array, re-order and transform each object in the array
      const reOrdenar = [...info].sort((a, b) => b.index - a.index);
      return reOrdenar.map(transformData);
    } else {
      // If info is a single object, transform it and wrap in an array
      return transformData(info);
    }
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "Recibo",
        header: "Codigo",
        mantineFilterTextInputProps: {
          placeholder: "N°",
        },
        size: 75,
      },
      {
        accessorKey: "Nombre",
        header: "Nombre",
        mantineFilterTextInputProps: {
          placeholder: "Cliente",
        },
        size: 150,
      },

      {
        accessorKey: "Celular",
        header: "Celular",
        mantineFilterTextInputProps: {
          placeholder: "Numero",
        },
        size: 100,
      },
      {
        accessorKey: "Direccion",
        header: "Direccion",
        enableColumnFilter: false,
        mantineFilterTextInputProps: {
          placeholder: "Direccion",
        },
        Cell: ({ cell }) => (
          <Textarea
            autosize
            minRows={1}
            maxRows={3}
            readOnly
            value={cell.getValue()}
          />
        ),
        size: 200,
      },
      {
        accessorKey: "Pago",
        header: "Pago",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["Completo", "Incompleto", "Pendiente"],
        },
        mantineFilterTextInputProps: { placeholder: "C / I / P" },
        editVariant: "select",
        mantineEditSelectProps: {
          data: [
            {
              value: "Completo",
              label: "Completo",
            },
            {
              value: "Incompleto",
              label: "Incompleto",
            },
            {
              value: "Pendiente",
              label: "Pendiente",
            },
          ],
        },
        enableEditing: false,
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
            disabled={true}
            clearable={true}
            searchable={false}
          />
        ),
        size: 180,
      },
      {
        accessorKey: "FechaIngreso.fecha",
        header: "Fecha Ingreso",
        mantineFilterTextInputProps: {
          placeholder: "A-M-D",
        },
        size: 120,
      },
      {
        accessorKey: "FechaAlmacenamiento.fecha",
        header: "Fecha Almacenamiento",
        mantineFilterTextInputProps: {
          placeholder: "A-M-D",
        },
        size: 150,
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

  useEffect(() => {
    handleGetAlmacenados();
  }, []);

  // useEffect(() => {
  //   // Add the event listener
  //   socket.on('server:updateListOrder:child', (data) => {
  //     setInfoAlmacenados((prevInfoAlmacenados) => [...prevInfoAlmacenados, ...handleGetFactura(data)]);
  //   });

  //   return () => {
  //     // Remove the event listener when the component unmounts
  //     socket.off('server:updateListOrder:child');
  //   };
  // }, []);

  useEffect(() => {
    const filterById = (array, data) =>
      array.filter((item) => data._id !== item._id);

    const handleUpdate = (data) => {
      if (data.location !== 2 || data.estadoPrenda === "anulado") {
        const updatedInfoAlmacenados = filterById(infoAlmacenados, data);
        const updatedRowSelection = filterById(rowSelection, data);
        const updatedOrderSelection = filterById(orderSelection, data);

        setInfoAlmacenados(updatedInfoAlmacenados);
        setRowSelection(updatedRowSelection);
        setOrderSelection(updatedOrderSelection);
      } else {
        const facturaToAdd = handleGetFactura(data);

        // Check if the facturaToAdd already exists in infoAlmacenados
        const facturaExistsIndex = infoAlmacenados.findIndex(
          (factura) => factura._id === facturaToAdd._id
        );

        if (facturaExistsIndex !== -1) {
          // La factura ya existe, actualízala
          setInfoAlmacenados((prevInfoAlmacenados) => {
            const updatedInfoAlmacenados = [...prevInfoAlmacenados];
            updatedInfoAlmacenados[facturaExistsIndex] = facturaToAdd;
            return updatedInfoAlmacenados;
          });
        } else {
          // La factura no existe, agrégala
          setInfoAlmacenados((prevInfoAlmacenados) => [
            ...prevInfoAlmacenados,
            facturaToAdd,
          ]);
        }
      }
    };

    socket.on("server:orderUpdated:child", (data) => handleUpdate(data));

    socket.on("server:updateListOrder:child", (data) => {
      data.forEach((orden) => {
        handleUpdate(orden);
      });
    });
    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:orderUpdated:child");
      socket.off("server:updateListOrder:child");
    };
  }, [infoAlmacenados]);

  return (
    <div className="content-almacen">
      <h1>ALMACEN</h1>
      <div className="list-a">
        <div className="actions">
          <button
            className={`button_wrapper ${loading ? "loading" : ""}`}
            onClick={handleExport}
          >
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                />
              </svg>
            </div>
          </button>

          {orderSelection.length > 0 ? (
            <div className="wrap" type="button" onClick={openConfirmacion}>
              <button className="button">Donar</button>
            </div>
          ) : null}
        </div>
        {orderSelection.length > 0 ? (
          <span>
            Existe {orderSelection.length} fila
            {orderSelection.length > 1 ? "s" : null} selecciona
            {orderSelection.length > 1 ? "das" : null}
          </span>
        ) : null}
        <MantineReactTable
          columns={columns}
          data={infoAlmacenados}
          initialState={{
            showColumnFilters: true,
            density: "xs",
            pagination: { pageSize: 5 },
          }}
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
          positionToolbarAlertBanner={"none"}
          mantineTableBodyRowProps={({ row }) => ({
            onDoubleClick: (event) => {
              const isSelected = row.getIsSelected();
              if (isSelected) {
                const updatedSelection = orderSelection.filter(
                  (selectedRow) => selectedRow._id !== row.original._id
                );
                setOrderSelection(updatedSelection);
              } else {
                setOrderSelection([...orderSelection, row.original]);
              }
              setRowSelection((prev) => ({
                ...prev,
                [row.id]: !prev[row.id],
              }));
              row.getToggleSelectedHandler()(event);
            },
            selected: rowSelection[row.id],
            sx: {
              cursor: "pointer",
            },
          })}
          enableRowActions={true}
          displayColumnDefOptions={{
            "mrt-row-actions": {
              size: 70,
              header: "Detalle",
            },
          }}
          renderRowActions={({ row }) => (
            <img
              className="ico-detail"
              src={imgDetalle}
              alt="detalle"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setOnModal("Detalle");
                setOnDetail(row.original);
                open();
              }}
            />
          )}
          state={{
            rowSelection,
          }}
          enableStickyHeader={true}
          enableRowVirtualization={true}
        />
      </div>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setOnDetail();
          setOnModal("");
        }}
        size={550}
        scrollAreaComponent={ScrollArea.Autosize}
        title={
          onModal === "Donados"
            ? "Ordenes Donados correctamente"
            : `Detalle de Pedido - ${onDetail?.Nombre.toUpperCase()} (codigo : ${
                onDetail?.Recibo
              })`
        }
        centered
      >
        {onModal === "Donados" ? (
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <i className="far fa-check-circle"></i>
              </ThemeIcon>
            }
          >
            {inDonation.map((a) => (
              <List.Item key={a._id}>
                Orden de Servicio N° {a.codRecibo} |{" "}
                {`"${a.Nombre.toUpperCase()}"`}
              </List.Item>
            ))}
          </List>
        ) : (
          <Detalle infoD={onDetail} />
        )}
      </Modal>
    </div>
  );
};

export default Almacen;
