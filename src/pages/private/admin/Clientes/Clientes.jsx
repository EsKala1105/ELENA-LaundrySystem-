/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { MantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import { Button, ScrollArea, Textarea } from "@mantine/core";
import { useState } from "react";
import { useMemo } from "react";

import React from "react";
import { Modal } from "@mantine/core";
import LoaderSpiner from "../../../../components/LoaderSpinner/LoaderSpiner";
import { documento } from "../../../../services/global";

const Clientes = () => {
  const [
    mActionCliente,
    { open: openModalActionCliente, close: closeModalActionCliente },
  ] = useDisclosure(false);

  const [listClientes, setListClientes] = useState([]);
  const [onLoading, setOnLoading] = useState(false);
  const [rowPick, setRowPick] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: `${documento}`,
        accessorKey: "documento",
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
        header: "Direccion",
        accessorKey: "direccion",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        Cell: ({ cell }) => (
          <Textarea value={cell.getValue()} minRows={3} maxRows={5} readOnly />
        ),
        size: 250,
      },
      {
        header: "Celular",
        accessorKey: "phone",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        size: 250,
      },
      {
        header: "Total de Puntos",
        accessorKey: "scoreTotal",
        size: 100,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Vigencia",
        accessorKey: "vigencia",
        size: 30,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Estado",
        accessorKey: "state",
        size: 30,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        // Cell: ({ cell }) => (
        //   <Box>
        //     {cell.getValue() === "activo" ? (
        //       <i style={{ color: "#2260ff" }} className="fa-solid fa-eye" />
        //     ) : (
        //       <i
        //         style={{ color: "#686868" }}
        //         className="fa-solid fa-eye-slash"
        //       />
        //     )}
        //   </Box>
        // ),
      },
    ],
    []
  );

  return (
    <div>
      <h1>Clientes</h1>
      <div>
        <MantineReactTable
          columns={columns}
          data={listClientes}
          initialState={{
            density: "xs",
            pagination: {},
            expanded: {
              1: false,
            },
          }}
          enableToolbarInternalActions={false}
          enableColumnActions={false}
          enableSorting={false}
          enableTopToolbar={false}
          enableExpandAll={false}
          enablePagination={false}
          enableBottomToolbar={false}
          enableStickyHeader
          renderDetailPanel={({ row }) => (
            <div className="sub-row">
              <div className="gasto-by-tipo">
                {row.original.infoScore
                  // .slice()
                  // .sort((a, b) => b.index - a.index)
                  .map((gasto, index) => (
                    <div className="" key={index}>
                      Gaaa
                    </div>
                  ))}
              </div>
            </div>
          )}
          mantineTableContainerProps={{
            sx: {
              //   maxHeight: "400px",
            },
          }}
          mantineTableBodyRowProps={({ row }) => ({
            onDoubleClick: () => {
              const iCliente = listClientes.find(
                (c) => c._id === row.original._id
              );

              setRowPick(iCliente);
              openModalActionCliente();
            },
          })}
        />
      </div>
      <Modal
        opened={mActionCliente}
        // closeOnClickOutside={false}
        // closeOnEscape={false}
        // withCloseButton={false}
        onClose={closeModalActionCliente}
        size="auto"
        title={""}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOnLoading(true);
          }}
        >
          {onLoading ? (
            <div className="loading-cupon">
              <LoaderSpiner />
            </div>
          ) : null}
          <div style={{ visibility: onLoading ? "hidden" : "visible" }}>
            <Button
              type="submit"
              className="btn-save"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
            >
              BOTON
            </Button>
            <div />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
