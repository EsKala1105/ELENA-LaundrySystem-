/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import { MantineReactTable } from "mantine-react-table";
import "./asistencia.scss";
import LoaderSpiner from "../../../../../components/LoaderSpinner/LoaderSpiner";
import Portal from "../../../../../components/PRIVATE/Portal/Portal";
import Maintenance from "./Accion/Maintenance";
import { useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes, Roles } from "../../../../../models";
import { useParams } from "react-router-dom";
import { Box, Button, NumberInput, Text, TextInput } from "@mantine/core";
import ValidIco from "../../../../../components/ValidIco/ValidIco";
import * as Yup from "yup";
import { useFormik } from "formik";
import TimePicker from "react-time-picker";
import Digital from "../../../../../components/Clock/Digital/Digital";
import { DatePickerInput, MonthPickerInput } from "@mantine/dates";
import { useSelector } from "react-redux";
import ExcelJS from "exceljs";
import { Notify } from "../../../../../utils/notify/Notify";
import { modals } from "@mantine/modals";

const Asistencia = () => {
  const { id } = useParams();
  const [infoPersonal, setInfoPersonal] = useState();
  const [extraInfo, setExtraInfo] = useState(null);
  const [listDays, setListDays] = useState([]);
  const [datePrincipal, setDatePrincipal] = useState(new Date());

  const [onChangeHorario, setChangeHorario] = useState(false);
  const [rowPick, setRowPick] = useState();
  const [Loading, setLoading] = useState(false);
  const [download, setDownload] = useState(false);

  const navigate = useNavigate();
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    horaIngreso: Yup.string().required("Campo obligatorio"),
    horaSalida: Yup.string().required("Campo obligatorio"),
    pagoByHour: Yup.string().required("Campo obligatorio"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      horaIngreso: "",
      horaSalida: "",
      pagoByHour: "",
      dateNacimiento: "",
      estado: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      confirmEditInfoPersonal(values);
    },
  });

  const generateListDay = (info) => {
    const fechaActual = moment();
    const primerDiaDelMes = moment(datePrincipal).startOf("month");
    let finalDiaDelMes;

    // Si estamos en el mes actual, finalDiaDelMes será el día actual
    if (moment().isSame(datePrincipal, "month")) {
      finalDiaDelMes = fechaActual.date();
    } else {
      // Si estamos en un mes anterior al actual, obtenemos el último día del mes anterior
      finalDiaDelMes = moment(datePrincipal).endOf("month").date();
    }

    return Array.from({ length: finalDiaDelMes }, (_, index) => {
      const fecha = moment(primerDiaDelMes)
        .add(index, "days")
        .format("YYYY-MM-DD");
      const objetoExistente = info.find((item) => item.fecha === fecha);

      if (objetoExistente) {
        return {
          ...objetoExistente,
          estado: "update",
        };
      } else {
        return {
          _id: "",
          fecha,
          tipoRegistro: "",
          ingreso: {
            hora: "",
            saved: false,
          },
          salida: {
            hora: "",
            saved: false,
          },
          observacion: "",
          time: {
            hora: 0,
            minutos: 0,
          },
          dateNacimiento: "",
          estado: "new",
        };
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Fecha",
        accessorKey: "fecha",
        size: 120,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Hora Ingreso",
        accessorKey: "ingreso.hora",
        size: 70,
        mantineTableBodyCellProps: {
          align: "center",
        },
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Hora Salida",
        accessorKey: "salida.hora",
        size: 70,
        mantineTableBodyCellProps: {
          align: "center",
        },
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Observacion",
        accessorKey: "observacion",
        size: 70,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        mantineTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <i
              onClick={() => {
                alert(cell.getValue());
              }}
              className="fa-solid fa-eye"
            ></i>
          ) : (
            "-"
          ),
      },
      {
        header: "Tiempo de Trabajo",
        accessorKey: "time",
        size: 70,
        mantineTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => (
          <Box>{`${cell.getValue().hora} h - ${
            cell.getValue().minutos
          } min`}</Box>
        ),
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
    ],
    []
  );

  const confirmEditInfoPersonal = (data) => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: "Actualizar Informacion de Personal",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro de Actualizar este Personal ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          handleUpdateInfoPersonal(data, id);
        }
      },
    });
  };

  const hangleGetInfoAsistencia = async () => {
    try {
      const dateP = moment(datePrincipal).format("YYYY-MM-DD");
      // Llamar a la API con la fecha formateada
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/get-list-asistencia/${dateP}/${id}`
      );
      setInfoPersonal(response.data);
    } catch (error) {
      console.error("Error al obtener asistencias:", error);
    }
  };

  const handleAddAsistencia = async (data) => {
    try {
      let response;
      if (data.estado === "new") {
        response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/lava-ya/registrar-asistencia`,
          { idPersonal: id, ...data }
        );
      } else {
        response = await axios.put(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/lava-ya/actualizar-asistencia/${data.id}`,
          data
        );
      }

      // Actualizar infoPersonal si existe infoPersonalUpdated en response.data
      let updatedInfoPersonal = { ...infoPersonal };
      if ("infoPersonalUpdated" in response.data) {
        const { infoPersonalUpdated } = response.data;
        const { birthDayUsed } = infoPersonalUpdated;
        updatedInfoPersonal.birthDayUsed = birthDayUsed;
      }

      // Actualizar listAsistencia
      let newListAsistencia = [...updatedInfoPersonal.listAsistencia];
      const { newInfoDay } = response.data;
      const existingDayIndex = newListAsistencia.findIndex(
        (day) => day.fecha === newInfoDay.fecha
      );

      if (existingDayIndex !== -1) {
        // Si se encontró un día con la misma fecha, remplazarlo
        newListAsistencia[existingDayIndex] = newInfoDay;
      } else {
        // Si no se encontró un día con la misma fecha, agregar newInfoDay
        newListAsistencia.push(newInfoDay);
      }
      updatedInfoPersonal.listAsistencia = newListAsistencia;

      // Actualizar infoPersonal
      setInfoPersonal(updatedInfoPersonal);

      Notify("Registro Exitoso", "", "success");
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
    }
  };

  const handleUpdateInfoPersonal = async (data, id) => {
    try {
      // Llamar a la API con la fecha formateada
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/actualizar-personal/${id}`,
        data
      );
      const { name, horaIngreso, horaSalida, pagoByHour, dateNacimiento } =
        response.data;

      setInfoPersonal({
        ...infoPersonal,
        name,
        horaIngreso,
        horaSalida,
        pagoByHour,
        dateNacimiento,
      });
      Notify("Actualizacion Exitoso", "", "success");
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
    }
  };

  const exportToExcel = async () => {
    const fileName = `Reporte de Asistencia - ${infoPersonal.names}`;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    // Establecer el valor de pago por hora por defecto
    const defaultPaymentPerHour = formik.values.pagoByHour;

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

    // Estilo para la fila "Monto a Pagar"
    const montoPagarStyle = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9EAD3" }, // Color de fondo para la fila (verde claro)
      },
    };

    // Agregar la cabecera
    worksheet
      .addRow([
        "Fecha",
        "Registro",
        `Hora Ingreso`,
        "Hora Salida",
        "Tiempo de Trabajo",
        "Observacion",
        "Horas Transformadas",
      ])
      .eachCell((cell) => {
        cell.fill = headerStyle.fill;
        cell.font = headerStyle.font;
      });

    // Agregar los datos de cada día
    listDays.forEach((item) => {
      let totalHoras = item.time.hora;
      let totalMinutos = item.time.minutos;

      // Sumar las horas completas de los minutos y ajustar los minutos restantes
      totalHoras += Math.floor(totalMinutos / 60);
      totalMinutos %= 60;

      // Calcular las horas transformadas sumando las horas y la fracción de hora de los minutos
      const totalHorasConvertidas = totalHoras + totalMinutos / 60;

      worksheet.addRow([
        item.fecha,
        item.tipoRegistro,
        item.ingreso.hora,
        item.salida.hora,
        item.time.hora || item.time.minutos
          ? `${item.time.hora} hr - ${item.time.minutos} min`
          : "-",
        item.observacion,
        +totalHorasConvertidas.toFixed(1),
      ]);
    });

    // Agregar fila de separación
    worksheet.addRow([]);

    const TotalHoras = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "Total de Horas : ",
      0,
    ]);

    TotalHoras.eachCell((cell, colNumber) => {
      if (colNumber === 6) {
        cell.fill = montoPagarStyle.fill;
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (colNumber === 7) {
        cell.border = {
          right: { style: "thin" },
          top: { style: "thin" },
        };
      }
    });

    // Calcular el total de horas transformadas y agregar la fila "Total de Horas"
    const totalHorasTransformadasCell = worksheet.getCell(
      `G${worksheet.rowCount}`
    );

    totalHorasTransformadasCell.value = {
      formula: `SUM(G2:G${worksheet.rowCount - 1})`,
    };

    // Agregar la fila "Pago por Hora"
    const PagoByHora = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "Pago por Hora : ",
      +defaultPaymentPerHour,
    ]);

    PagoByHora.eachCell((cell, colNumber) => {
      if (colNumber === 6) {
        cell.fill = montoPagarStyle.fill;
        cell.border = {
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (colNumber === 7) {
        cell.border = {
          right: { style: "thin" },
        };
      }
    });

    // Agregar fila "Monto a Pagar"
    const montoPagarRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "Monto a Pagar :",
      0,
    ]);
    montoPagarRow.eachCell((cell, colNumber) => {
      if (colNumber === 6) {
        cell.fill = montoPagarStyle.fill;
        cell.border = {
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (colNumber === 7) {
        cell.border = {
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    // Calcular el monto total (Pago) y agregar la fila "Monto a Pagar"
    const totalMontoCell = worksheet.getCell(`G${worksheet.rowCount}`);
    totalMontoCell.value = {
      formula: `G${worksheet.rowCount - 2}*G${worksheet.rowCount - 1}`, // Multiplica el total de horas transformadas por el pago por hora
    };

    // Aplicar estilos y formato
    worksheet.eachRow((row) => {
      row.alignment = {
        wrapText: true,
        horizontal: "center",
        vertical: "middle",
      };
    });

    let maxLengthColumns = 0;
    await worksheet.columns.forEach((column) => {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        maxLengthColumns = Math.max(maxLengthColumns, cellLength);
      });
      column.width = maxLengthColumns + 2; // Agrega un espacio adicional
    });

    // Aplicar autofiltro a todas las columnas y filas
    const totalRows = worksheet.rowCount;
    const totalColumns = worksheet.columnCount;

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: totalRows, column: totalColumns },
    };

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

  const handleCloseAction = () => {
    setRowPick();
    setChangeHorario(false);
  };

  useEffect(() => {
    hangleGetInfoAsistencia();
  }, [datePrincipal]);

  useEffect(() => {
    if (infoPersonal) {
      const conteo = infoPersonal?.listAsistencia.reduce(
        (conteo, asistencia) => {
          if (asistencia.tipoRegistro === "normal" && asistencia.observacion) {
            conteo.observaciones++;
          } else if (asistencia.tipoRegistro === "falta") {
            conteo.faltas++;
          } else if (asistencia.tipoRegistro === "feriado") {
            conteo.feriados++;
          }
          return conteo;
        },
        { observaciones: 0, faltas: 0, feriados: 0 }
      );
      // Obtener el año de la fecha proporcionada
      const momentFecha = moment(datePrincipal, "YYYY-MM-DD");
      const yearFecha = momentFecha.year();
      const BDUsado = infoPersonal?.birthDayUsed.some((birthday) => {
        return moment(birthday).year() === yearFecha;
      });
      setExtraInfo({
        BDUsado,
        ...conteo,
      });
      const ListDaysAsistidos = generateListDay(infoPersonal?.listAsistencia);

      setListDays(ListDaysAsistidos);
      formik.setFieldValue("name", infoPersonal.name);
      formik.setFieldValue("horaIngreso", infoPersonal.horaIngreso);
      formik.setFieldValue("horaSalida", infoPersonal.horaSalida);
      formik.setFieldValue("pagoByHour", infoPersonal.pagoByHour);
      formik.setFieldValue("dateNacimiento", infoPersonal.dateNacimiento);
    }
  }, [infoPersonal, datePrincipal]);

  useEffect(() => {
    if (rowPick) {
      setChangeHorario(true);
    }
  }, [rowPick]);

  const handleExport = () => {
    if (!download) {
      setDownload(true);
      setTimeout(() => {
        setDownload(false);
        exportToExcel();
      }, 2400);
    }
  };

  return (
    <div className="content-asistencias">
      <div className="head-i">
        <div className="left-ih">
          <h1>Asistencia</h1>
          <div className="blocks-ih">
            <div className="block">
              <span className="title-b">CUMPLEAÑOS</span>
              <div className="info-b">
                {extraInfo?.BDUsado ? "USADO" : "SIN USAR"}
              </div>
            </div>
            <div className="block">
              <span className="title-b">FALTAS</span>
              <div className="info-b">{extraInfo?.faltas}</div>
            </div>
            <div className="block">
              <span className="title-b">FERIADOS</span>
              <div className="info-b">{extraInfo?.feriados}</div>
            </div>
            <div className="block">
              <span className="title-b">OBSERVACIONES</span>
              <div className="info-b">{extraInfo?.observaciones}</div>
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.PERSONAL}`);
          }}
          color="teal"
        >
          Retroceder
        </Button>
      </div>
      <hr />
      {Loading ? (
        <LoaderSpiner />
      ) : (
        <div className="personal-info">
          <div className="info-form">
            <Digital />
            <hr />
            <form onSubmit={formik.handleSubmit} className="i-box">
              <div className="input-item">
                <TextInput
                  name="name"
                  label="Nombre de Personal :"
                  value={formik.values.name}
                  placeholder="Ingrese numero"
                  autoComplete="off"
                  disabled={InfoUsuario.rol !== Roles.ADMIN ? true : false}
                  onChange={formik.handleChange}
                />
                {formik.errors.name &&
                  formik.touched.name &&
                  ValidIco(formik.errors.name)}
              </div>
              <div className="time-asis">
                <div className="input-item">
                  <div className="input-date">
                    <label htmlFor="">Hora Ingreso :</label>
                    <TimePicker
                      className="hour-date"
                      onChange={(newTime) => {
                        const timeMoment = moment(newTime, "HH:mm");
                        const timeString = timeMoment.format("HH:mm");
                        formik.setFieldValue("horaIngreso", timeString);
                      }}
                      value={
                        moment(formik.values.horaIngreso, "HH:mm").isValid()
                          ? moment(formik.values.horaIngreso, "HH:mm").toDate()
                          : null
                      }
                      disabled={InfoUsuario.rol !== Roles.ADMIN ? true : false}
                      amPmAriaLabel="Select AM/PM" // Aquí debe ir una cadena descriptiva
                      clockIcon={null} // Esto oculta el icono del reloj, si lo deseas
                      clearIcon={null} // Esto oculta el icono de limpieza, si lo deseas
                      disableClock={true}
                      format="h:mm a"
                    />
                  </div>
                  {formik.errors.horaIngreso &&
                    formik.touched.horaIngreso &&
                    ValidIco({
                      mensaje: formik.errors.horaIngreso,
                    })}
                </div>
                <div className="input-item">
                  <div className="input-date">
                    <label htmlFor="">Hora Salida :</label>
                    <TimePicker
                      className="hour-date"
                      onChange={(newTime) => {
                        const timeMoment = moment(newTime, "HH:mm");
                        const timeString = timeMoment.format("HH:mm");
                        formik.setFieldValue("horaSalida", timeString);
                      }}
                      value={
                        moment(formik.values.horaSalida, "HH:mm").isValid()
                          ? moment(formik.values.horaSalida, "HH:mm").toDate()
                          : null
                      }
                      disabled={InfoUsuario.rol !== Roles.ADMIN ? true : false}
                      amPmAriaLabel="Select AM/PM" // Aquí debe ir una cadena descriptiva
                      clockIcon={null} // Esto oculta el icono del reloj, si lo deseas
                      clearIcon={null} // Esto oculta el icono de limpieza, si lo deseas
                      disableClock={true}
                      format="h:mm a"
                    />
                  </div>
                  {formik.errors.horaSalida &&
                    formik.touched.horaSalida &&
                    ValidIco({
                      mensaje: formik.errors.horaSalida,
                    })}
                </div>
              </div>
              <div className="input-item">
                <DatePickerInput
                  name="dateNacimiento"
                  dropdownType="modal"
                  label="Fecha de Nacimiento"
                  placeholder="Fecha de Nacimiento"
                  disabled={InfoUsuario.rol !== Roles.ADMIN ? true : false}
                  value={
                    moment(formik.values.dateNacimiento, "YYYY-MM-DD").isValid()
                      ? moment(
                          formik.values.dateNacimiento,
                          "YYYY-MM-DD"
                        ).toDate()
                      : null
                  }
                  onChange={(date) => {
                    formik.setFieldValue(
                      "dateNacimiento",
                      moment(date).format("YYYY-MM-DD")
                    );
                  }}
                />
                {formik.errors.name &&
                  formik.touched.name &&
                  ValidIco(formik.errors.name)}
              </div>
              {InfoUsuario.rol === Roles.ADMIN ? (
                <>
                  <div className="input-item">
                    <NumberInput
                      name="pagoByHour"
                      label="Pago por Hora :"
                      value={formik.values.pagoByHour}
                      precision={2}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "pagoByHour",
                          !Number.isNaN(e) ? e : 0
                        );
                      }}
                      min={0}
                      step={0.5}
                      hideControls
                      autoComplete="off"
                    />
                    {formik.errors.horaSalida &&
                      formik.touched.horaSalida &&
                      ValidIco({
                        mensaje: formik.errors.horaSalida,
                      })}
                  </div>

                  <Button type="submit" className="btn-save" color="blue">
                    Guardar
                  </Button>
                </>
              ) : null}
            </form>
          </div>
          <div className="list-personal">
            <div className="head-list">
              <MonthPickerInput
                style={{ position: "relative", margin: "auto 0" }}
                label="Ingrese Fecha"
                placeholder="Pick date"
                maxDate={new Date()}
                value={datePrincipal}
                onChange={(date) => {
                  setDatePrincipal(date);
                }}
                maw={400}
              />
              {InfoUsuario.rol === Roles.ADMIN ? (
                <button
                  className={`button_wrapper ${download ? "loading" : ""}`}
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
              ) : null}
            </div>
            <MantineReactTable
              columns={columns}
              data={listDays}
              initialState={{
                density: "xs",
                pagination: {},
              }}
              enableToolbarInternalActions={false}
              enableColumnActions={false}
              enableSorting={false}
              enableTopToolbar={false}
              enableExpandAll={false}
              enablePagination={false}
              enableBottomToolbar={false}
              enableStickyHeader
              mantineTableContainerProps={{
                sx: {
                  maxHeight: "340px",
                },
              }}
              mantineTableBodyRowProps={({ row }) => ({
                onDoubleClick: () => {
                  const {
                    horaIngreso,
                    horaSalida,
                    dateNacimiento,
                    birthDayUsed,
                    id,
                  } = infoPersonal;
                  setRowPick({
                    infoPersonal: {
                      horaIngreso,
                      horaSalida,
                      dateNacimiento,
                      birthDayUsed,
                      id,
                    },
                    infoDay: row.original,
                  });
                },
              })}
            />
          </div>
        </div>
      )}
      {onChangeHorario && (
        <Portal
          onClose={() => {
            setChangeHorario(false);
          }}
        >
          <Maintenance
            onClose={handleCloseAction}
            info={rowPick}
            onAddAsistencia={handleAddAsistencia}
          />
        </Portal>
      )}
    </div>
  );
};

export default Asistencia;
