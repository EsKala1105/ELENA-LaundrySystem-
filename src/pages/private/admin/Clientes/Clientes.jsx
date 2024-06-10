/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { MantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  NumberInput,
  ScrollArea,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import React from "react";
import { Modal } from "@mantine/core";
import LoaderSpiner from "../../../../components/LoaderSpinner/LoaderSpiner";
import { documento } from "../../../../services/global";
import axios from "axios";
import { Notify } from "../../../../utils/notify/Notify";
import { useEffect } from "react";
import "./clientes.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  addCliente,
  deleteCliente,
  updateCliente,
} from "../../../../redux/actions/aClientes";

const Clientes = () => {
  const [mOptions, { open: openModalOptions, close: closeModalOptions }] =
    useDisclosure(false);

  const [
    mActionCliente,
    { open: openModalActionCliente, close: closeModalActionCliente },
  ] = useDisclosure(false);

  const [onLoading, setOnLoading] = useState(false);
  const [rowPick, setRowPick] = useState(null);
  const [action, setAction] = useState("");

  const dispatch = useDispatch();
  const listClientes = useSelector((state) => state.clientes.listClientes);

  const validationSchema = Yup.object().shape({
    nombre: Yup.string().required("Campo obligatorio"),
  });

  const formik = useFormik({
    initialValues: {
      dni: "",
      nombre: "",
      direccion: "",
      phone: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setOnLoading(true);
      if (action === "add") {
        handleAddClientes(values);
      } else {
        handleUpdateCliente(rowPick?._id, values);
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        header: `${documento}`,
        accessorKey: "dni",
        size: 120,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Nombre",
        accessorKey: "nombre",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        size: 250,
      },

      {
        header: "Celular",
        accessorKey: "phone",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        size: 100,
      },
      {
        header: "Total de Puntos",
        enableColumnFilter: false,
        accessorKey: "scoreTotal",
        size: 130,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Direccion",
        enableColumnFilter: false,
        accessorKey: "direccion",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        Cell: ({ cell }) => (
          <Textarea value={cell.getValue()} minRows={1} maxRows={5} readOnly />
        ),
        size: 200,
      },
    ],
    []
  );

  const handleAddClientes = async (newCliente) => {
    dispatch(addCliente(newCliente));
    setOnLoading(false);
    handleCloseAction();
  };

  const handleDeleteCliente = async (id) => {
    dispatch(deleteCliente(id));
    setRowPick();
  };

  const handleUpdateCliente = async (id, datosCliente) => {
    dispatch(updateCliente({ id, datosCliente }));
    setOnLoading(false);
    handleCloseAction();
  };

  const handleCloseAction = () => {
    formik.resetForm();
    setRowPick();
    setAction("");
    closeModalActionCliente();
  };

  useEffect(() => {
    if (rowPick) {
      formik.setFieldValue("dni", rowPick?.dni);
      formik.setFieldValue("nombre", rowPick?.nombre);
      formik.setFieldValue("direccion", rowPick?.direccion);
      formik.setFieldValue("phone", rowPick?.phone);
    } else {
      formik.resetForm();
    }
  }, [rowPick]);

  return (
    <div className="content-clientes">
      <div className="header-cli">
        <h1>Clientes</h1>
        <Button
          type="button"
          onClick={() => {
            setRowPick();
            setAction("add");
            openModalActionCliente();
          }}
          className="btn-save"
          color="blue"
        >
          Nuevo Cliente
        </Button>
      </div>
      <div className="body-clientes">
        <div className="list-clientes">
          <MantineReactTable
            columns={columns}
            data={listClientes}
            initialState={{
              showColumnFilters: true,
              density: "xs",
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
            enableExpandAll={false}
            enablePagination={false}
            enableBottomToolbar={false}
            enableStickyHeader
            mantineTableContainerProps={{
              sx: {
                maxHeight: "400px",
              },
            }}
            enableRowVirtualization={true} // no scroll lateral
            mantineTableBodyRowProps={({ row }) => {
              const iCliente = listClientes.find(
                (c) => c._id === row.original._id
              );

              const handleClick = () => {
                setRowPick(iCliente);
              };

              const handleDoubleClick = () => {
                setRowPick(iCliente);
                openModalOptions();
              };

              return {
                onClick: handleClick,
                onDoubleClick: handleDoubleClick,
              };
            }}
          />
        </div>
        <div className="detail-cliente">
          <span className="title-detail">Historial de Órdenes</span>

          <div className="table-wrapper">
            <table className="sticky-table">
              <thead>
                <tr>
                  <th>ORDEN</th>
                  <th>FECHA</th>
                  <th>PUNTOS</th>
                </tr>
              </thead>
              <tbody>
                {rowPick?.infoScore.map((visita, index) => (
                  <tr key={index}>
                    <td>{visita.codigo}</td>
                    <td>{visita.dateService.fecha}</td>
                    <td>{visita.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="info-extra">
            <span>Total de Visitas </span>
            <span>
              {rowPick?.infoScore &&
                new Set(rowPick?.infoScore.map((item) => item.idOrdenService))
                  .size}
            </span>
          </div>
        </div>
      </div>
      <Modal
        opened={mOptions}
        // closeOnClickOutside={false}
        // closeOnEscape={false}
        // withCloseButton={false}
        onClose={closeModalOptions}
        size="auto"
        title={rowPick?.nombre}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <Button
            type="button"
            onClick={() => {
              setAction("edit");
              closeModalOptions();
              openModalActionCliente();
            }}
            className="btn-save"
            color="yellow"
          >
            ACTUALIZAR INFORMACION
          </Button>
          <Button
            type="button"
            onClick={() => {
              handleDeleteCliente(rowPick?._id);
              closeModalOptions();
            }}
            className="btn-save"
            color="red"
          >
            ELIMINAR CLIENTE
          </Button>
        </div>
      </Modal>
      <Modal
        opened={mActionCliente}
        // closeOnClickOutside={false}
        // closeOnEscape={false}
        // withCloseButton={false}
        onClose={() => {
          closeModalActionCliente();
          handleCloseAction();
        }}
        size="auto"
        title={""}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <form onSubmit={formik.handleSubmit}>
          {onLoading ? (
            <div className="loading-cupon">
              <LoaderSpiner />
            </div>
          ) : null}
          <div
            className="form-cliente"
            style={{ visibility: onLoading ? "hidden" : "visible" }}
          >
            <TextInput
              name="nombre"
              label="Nombre :"
              value={formik.values.nombre}
              onChange={(e) => {
                formik.setFieldValue("nombre", e.target.value);
              }}
              required
              autoComplete="off"
            />
            <TextInput
              name="dni"
              label={`${documento} : `}
              value={formik.values.dni}
              onChange={(e) => {
                formik.setFieldValue("dni", e.target.value);
              }}
              autoComplete="off"
            />
            <Textarea
              name="direccion"
              label="Direccion"
              placeholder="Ingrese Direccion"
              onChange={(e) => {
                formik.setFieldValue("direccion", e.target.value);
              }}
              value={formik.values.direccion}
            />
            <TextInput
              name="phone"
              onChange={formik.handleChange}
              label="Numero :"
              autoComplete="off"
              value={formik.values.phone}
            />
            {action === "edit" ? (
              <div className="info-puntaje">
                <span>Total de Puntos : </span>
                <span>{rowPick?.scoreTotal}</span>
              </div>
            ) : null}

            <Button type="submit" className="btn-save" color="blue">
              {action === "add" ? "REGISTRAR" : "ACTUALIZAR"}
            </Button>
            <div />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
