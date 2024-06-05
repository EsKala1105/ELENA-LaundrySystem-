/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

import { PublicRoutes } from "../../../models/Routes-M/Routes";
import "./logout.scss";
// import { LogoutUser } from '../../../services/default.services';
import IcoClose from "./logout.png";

const Logout = () => {
  const navigate = useNavigate();

  const openModal = () =>
    modals.openConfirmModal({
      title: "CERRAR SESION",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres CERRAR SESION ?</Text>
      ),
      labels: { confirm: "Cerrar Sesion", cancel: "No" },
      confirmProps: { color: "red" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => handleLogout(),
    });

  const handleLogout = async () => {
    //clearLocalStorage(userKey);

    // const persistenceInfo = JSON.parse(localStorage.getItem("user"));
    // if (persistenceInfo) {
    //   await LogoutUser(persistenceInfo.token);
    // }

    //dispatch(resetUser());
    navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
  };

  return (
    <div onClick={openModal} className="content-logout">
      <button className="btn-logout" type="button">
        <img src={IcoClose} alt="cerrar_session" />
      </button>
    </div>
  );
};

export default Logout;
