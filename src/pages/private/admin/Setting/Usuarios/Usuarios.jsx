/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Button, Select, Table, TextInput } from "@mantine/core";
import * as Yup from "yup";
import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import "./usuarios.scss";
import { ReactComponent as Eliminar } from "../../../../../utils/img/OrdenServicio/eliminar.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteUser,
  EditUser,
  GetListUser,
  RegisterUser,
} from "../../../../../redux/actions/aUser";
import {
  clearDuplicated,
  LS_AddUser,
  LS_DeleteUser,
  LS_UpdateUser,
  resetUser,
} from "../../../../../redux/states/user";
import LoaderSpiner from "../../../../../components/LoaderSpinner/LoaderSpiner";
import { socket } from "../../../../../utils/socket/connect";
import { Roles } from "../../../../../models";

const baseState = {
  _id: "",
  name: "",
  phone: "",
  email: "",
  rol: "",
  usuario: "",
  password: "",
};

const Usuarios = () => {
  const dispatch = useDispatch();
  const ListUsuarios = useSelector((state) => state.user.listUsuario);
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const { warningDuplicated } = useSelector((state) => state.user);
  const [onEdit, setOnEdit] = useState(false);
  const [onLoading, setOnLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(baseState);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    phone: Yup.string().required("Campo obligatorio"),
    email: Yup.string()
      .required("Campo obligatorio")
      .email("Debe ser un correo electrónico válido"),
    rol: Yup.string().required("Campo obligatorio"),
    usuario: Yup.string().required("Campo obligatorio"),
    password: onEdit
      ? ""
      : Yup.string()
          .required("Campo obligatorio")
          .matches(
            /^[a-zA-Z0-9]{5,}$/,
            "Debe contener al menos 5 caracteres (solo letras y números)"
          ),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      valiProcess(values);
    },
  });

  const valiProcess = (data) => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: `${onEdit ? "Actualizacion de Usuario" : "Registro de Usuario"}`,
      centered: true,
      children: (
        <Text size="sm">
          {onEdit
            ? "¿ Estas seguro de EDITAR este USUARIO ?"
            : "¿ Estas seguro de AGREGAR este nuevo USUARIO ?"}
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          if (onEdit === true) {
            setOnLoading(true);
            dispatch(EditUser(data)).then((response) => {
              if (response.payload) {
                setOnEdit(false);
                setInitialValues(baseState);
                formik.resetForm();
                setOnLoading(false);
              }
              if ("error" in response) {
                setOnLoading(false);
              }
            });
          } else {
            setOnLoading(true);
            dispatch(RegisterUser(data)).then((response) => {
              if (response.payload) {
                setInitialValues(baseState);
                formik.resetForm();
                setOnLoading(false);
              }
              if ("error" in response) {
                setOnLoading(false);
              }
            });
          }
        }
      },
    });
  };

  const validDeleteUsuario = (id) => {
    let confirmationEnabled = true;

    modals.openConfirmModal({
      title: "Eliminar Usuario",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro de eliminar este usuario ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        if (confirmationEnabled) {
          confirmationEnabled = false;
          dispatch(DeleteUser(id));
        }
      },
    });
  };

  const validIco = (mensaje) => {
    return (
      <div className="ico-req">
        <i className="fa-solid fa-circle-exclamation ">
          <div className="info-req" style={{ pointerEvents: "none" }}>
            <span>{mensaje}</span>
          </div>
        </i>
      </div>
    );
  };

  const validEnabledAccion = (user) => {
    return InfoUsuario.rol === "admin"
      ? false
      : InfoUsuario.rol === "gerente" && user.rol === "gerente"
      ? user._id === InfoUsuario._id
        ? false
        : true
      : InfoUsuario.rol === "gerente" && user.rol !== "admin"
      ? false
      : true;
  };

  useEffect(() => {
    if (ListUsuarios.length === 0) {
      dispatch(GetListUser());
    }
  }, [ListUsuarios]);

  // useEffect(() => {
  //   if (warningDuplicated.length > 0) {
  //     console.log(warningDuplicated);
  //   }
  // }, [warningDuplicated]);

  useEffect(() => {
    // Nuevo Usuario Agregado
    socket.on("server:onNewUser", (data) => {
      dispatch(LS_AddUser(data));
    });

    // Usuario Eliminado
    socket.on("server:onDeleteUser", (data) => {
      dispatch(LS_DeleteUser(data));
      if (InfoUsuario._id === data) {
        alert("Comunicado del Administrador : Su cuenta Fue Eliminada");
        dispatch(resetUser());
      }
    });

    // Usuario Actualizado
    socket.on("server:onUpdateUser", (data) => {
      dispatch(LS_UpdateUser(data));
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:onNewUser");
      socket.off("server:onDeleteUser");
      socket.off("server:onUpdateUser");
    };
  }, []);

  return (
    <div className="content-users">
      <div className="form-users">
        <form onSubmit={formik.handleSubmit} className="container">
          {onLoading === true ? (
            <LoaderSpiner />
          ) : (
            <>
              <div className="h-title">
                <h1>{onEdit ? "Editar Usuario" : "Registrar Usuario"}</h1>
                {onEdit ? (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setOnEdit(false);
                      setInitialValues(baseState);
                    }}
                  >
                    <Eliminar className="cancel-edit" />
                  </button>
                ) : null}
              </div>
              <div className="input-item">
                <TextInput
                  name="name"
                  label="Nombre :"
                  value={formik.values.name}
                  placeholder="Ingrese nombre"
                  autoComplete="off"
                  required
                  // disabled={validEnabledAccion(initialValues)}
                  onChange={formik.handleChange}
                />
                {formik.errors.name &&
                  formik.touched.name &&
                  validIco(formik.errors.name)}
              </div>
              <div className="input-item">
                <TextInput
                  name="phone"
                  label="Numero Telefonico :"
                  value={formik.values.phone}
                  placeholder="Ingrese numero"
                  autoComplete="off"
                  required
                  // disabled={validEnabledAccion(initialValues)}
                  onChange={formik.handleChange}
                />
                {formik.errors.phone &&
                  formik.touched.phone &&
                  validIco(formik.errors.phone)}
              </div>
              <div className="input-item">
                <TextInput
                  name="email"
                  label="Correo Electronico :"
                  error={
                    warningDuplicated.includes("correo")
                      ? "correo ya esta siendo usado"
                      : false
                  }
                  value={formik.values.email}
                  placeholder="Ingrese correo"
                  autoComplete="off"
                  required
                  disabled={validEnabledAccion(initialValues)}
                  onChange={(e) => {
                    formik.setFieldValue("email", e.target.value);
                    dispatch(clearDuplicated("correo"));
                  }}
                />
                {formik.errors.email &&
                  formik.touched.email &&
                  validIco(formik.errors.email)}
              </div>
              <div className="input-item">
                <Select
                  name="rol"
                  label="Rol"
                  value={formik.values.rol}
                  onChange={(e) => {
                    formik.setFieldValue("rol", e);
                  }}
                  placeholder="Escoge el rol"
                  clearable={
                    initialValues.rol === Roles.ADMIN ||
                    initialValues.rol === Roles.GERENTE
                      ? false
                      : true
                  }
                  searchable
                  // disabled={validEnabledAccion(initialValues)}
                  readOnly={
                    initialValues._id === InfoUsuario._id ||
                    initialValues.rol === Roles.GERENTE
                  }
                  data={[
                    {
                      value: "admin",
                      label: "Administrador",
                      disabled: true,
                    },
                    {
                      value: "gerente",
                      label: "Gerente",
                      disabled: InfoUsuario.rol === Roles.ADMIN ? false : true,
                    },
                    {
                      value: "coord",
                      label: "Coordinador",
                      disabled:
                        InfoUsuario.rol === Roles.ADMIN ||
                        InfoUsuario.rol === Roles.GERENTE
                          ? false
                          : true,
                    },
                    {
                      value: "pers",
                      label: "Personal",
                      disabled:
                        InfoUsuario.rol === Roles.ADMIN ||
                        InfoUsuario.rol === Roles.GERENTE
                          ? false
                          : true,
                    },
                  ]}
                />
                {formik.errors.rol &&
                  formik.touched.rol &&
                  validIco(formik.errors.rol)}
              </div>
              <div className="account">
                <div className="input-item">
                  <TextInput
                    name="usuario"
                    label="Usuario :"
                    value={formik.values.usuario}
                    error={
                      warningDuplicated.includes("usuario")
                        ? "usuario ya existe"
                        : false
                    }
                    // disabled={validEnabledAccion(initialValues)}
                    placeholder="Ingrese usuario"
                    autoComplete="off"
                    required
                    onChange={(e) => {
                      formik.setFieldValue("usuario", e.target.value);
                      dispatch(clearDuplicated("usuario"));
                    }}
                  />
                  {formik.errors.usuario &&
                    formik.touched.usuario &&
                    validIco(formik.errors.usuario)}
                </div>
                <div className="input-item">
                  <TextInput
                    name="password"
                    label="Contraseña :"
                    description={
                      onEdit
                        ? "el campo vacio, mantiene la contraseña anterior"
                        : true
                    }
                    value={formik.values.password}
                    placeholder="Ingrese contraseña"
                    autoComplete="off"
                    required={onEdit ? false : true}
                    // disabled={validEnabledAccion(initialValues)}
                    onChange={formik.handleChange}
                  />

                  {onEdit
                    ? null
                    : formik.errors.password &&
                      formik.touched.password &&
                      validIco(formik.errors.password)}
                </div>
              </div>
              <Button
                type="submit"
                variant="gradient"
                gradient={
                  onEdit
                    ? { from: "rgba(255, 178, 46, 1)", to: "red", deg: 90 }
                    : { from: "indigo", to: "cyan" }
                }
              >
                {onEdit ? "Editar Usuario" : "Registrar Usuario"}
              </Button>
            </>
          )}
        </form>
      </div>
      <div className="list-users">
        {ListUsuarios?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Numero</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Usuario</th>
                <th>Activado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ListUsuarios.filter((user) => user.state !== "eliminado").map(
                (p, index) => (
                  <tr key={index}>
                    <td>{p.name}</td>
                    <td>{p.phone}</td>
                    <td>{p.email}</td>
                    <td>{p.rol}</td>
                    <td>{p.usuario}</td>
                    <td>{p.state}</td>
                    <td>
                      <div className="actions">
                        {validEnabledAccion(p) === false ? (
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => {
                              setInitialValues({
                                _id: p?._id,
                                name: p?.name,
                                phone: p?.phone,
                                email: p?.email,
                                rol: p?.rol,
                                usuario: p?.usuario,
                                password: "",
                              });
                              setOnEdit(true);
                            }}
                          >
                            <i className="fas fa-user-edit" />
                          </button>
                        ) : null}

                        {validEnabledAccion(p) === false ? (
                          p._id === InfoUsuario._id ? null : (
                            <button
                              className="btn-delete"
                              type="button"
                              onClick={() => {
                                validDeleteUsuario(p._id);
                              }}
                            >
                              <i className="fas fa-user-times" />
                            </button>
                          )
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        ) : null}
      </div>
    </div>
  );
};

export default Usuarios;
