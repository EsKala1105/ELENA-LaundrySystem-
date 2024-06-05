/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import "./infoServicios.scss";
import { ReactComponent as Eliminar } from "../../../../utils/img/OrdenServicio/eliminar.svg";
import { nameImpuesto, simboloMoneda } from "../../../../services/global";
import { NumberInput } from "@mantine/core";
import { useSelector } from "react-redux";
import BotonModel from "../../BotonModel/BotonModel";
import InputSelectedPrenda from "../../InputSelectedPrenda/InputSelectedPrenda";
import { useEffect } from "react";
import ValidIco from "../../../ValidIco/ValidIco";
import { formatThousandsSeparator } from "../../../../utils/functions";

const InfoServicios = ({
  paso,
  descripcion,
  changeValue,
  iCliente,
  values,
  iEdit,
  iDelivery,
  iServicios,
  iPuntos,
  error,
  touched,
}) => {
  const iNegocio = useSelector((state) => state.negocio.infoNegocio);
  const iCategorias = useSelector((state) => state.categorias.listCategorias);

  const addRowGarment = (idServicio) => {
    const IService = iServicios.find((service) => service._id === idServicio);
    const ICategory = iCategorias.find(
      (cat) => cat._id === IService.idCategoria
    );

    const isDelivery =
      ICategory.nivel === "primario" && IService.nombre === "Delivery"
        ? true
        : false;
    const isOtros =
      ICategory.nivel === "primario"
        ? IService.nombre === "Otros"
          ? true
          : false
        : false;
    // const isEditSaved = iEdit?.estado === "registrado" ? true : false;
    const isEditSaved = false;

    const newRow = {
      cantidad: 1,
      item:
        IService.nombre === "Otros" && ICategory.name === "Unico"
          ? ""
          : IService.nombre,
      descripcion: "",
      expanded: false,
      price: IService.precioVenta,
      total: IService.precioVenta,
      tipo: "servicio",
      identificador: IService._id,
      simboloMedida: IService.simboloMedida,
      disable: {
        cantidad: isEditSaved ? true : isDelivery ? true : false,
        item: isEditSaved ? true : isDelivery ? true : isOtros ? false : true,
        descripcion: isDelivery,
        total: isEditSaved,
        action: isDelivery,
      },
    };

    return newRow;
  };

  const handleTextareaHeight = (textarea) => {
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
    textarea.style.padding = `5px`;
  };

  const handleScrollTop = (id) => {
    const element = document.getElementById(id);
    if (element instanceof HTMLTextAreaElement) {
      element.scrollTop = 0;
    }
  };

  const calculateTotalNeto = (items) => {
    let subTotal = 0;

    if (items && items.length > 0) {
      subTotal = items.reduce((sum, item) => {
        const total = parseFloat(item.total) || 0;

        return sum + total;
      }, 0);
    }

    return subTotal;
  };

  const MontoxPoints = (xpoints) => {
    const puntos = parseFloat(iPuntos.score);
    const valor = parseFloat(iPuntos.valor);
    const equivalenteEnSoles = (xpoints / puntos) * valor;

    return equivalenteEnSoles;
  };

  useEffect(() => {
    const subtotal = Number(calculateTotalNeto(values.items).toFixed(2));
    changeValue("subTotal", subtotal);
  }, [values.items]);

  return (
    <div className="info-servicios">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        <div className="actions">
          <div className="button-actions">
            {iNegocio.itemsAtajos.length > 0
              ? iNegocio.itemsAtajos.map((items, index) => {
                  const IService = iServicios.find(
                    (service) => service._id === items
                  );

                  return (
                    <BotonModel
                      key={index}
                      name={`Agregar ${IService?.nombre}`}
                      disabled={
                        iEdit ? (iEdit.modeEditAll ? false : true) : false
                      }
                      listenClick={() => {
                        changeValue("items", [
                          ...values.items,
                          addRowGarment(IService?._id),
                        ]);
                      }}
                    />
                  );
                })
              : null}
          </div>
          <InputSelectedPrenda
            listenClick={(info) => {
              changeValue("items", [...values.items, addRowGarment(info)]);
            }}
            disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
            tabI={"7"}
          />
        </div>
        <div className="content-list-service">
          <table className="tabla-service">
            <thead>
              <tr>
                <th>Cantidad</th>
                <th>Item</th>
                <th>Descripción</th>
                <th>Total</th>
                <th>{""}</th>
              </tr>
            </thead>
            <tbody>
              {values.items.map((row, index) => (
                <tr key={index}>
                  <td>
                    <NumberInput
                      name={`items.${index}.cantidad`}
                      className="txtCantidad"
                      disabled={row.disable.cantidad}
                      value={+values.items[index].cantidad || ""}
                      formatter={(value) => formatThousandsSeparator(value)}
                      onChange={(value) => {
                        const price = values.items[index].price || 0;
                        const newTotal = value * price;
                        changeValue(`items.${index}.cantidad`, value);
                        changeValue(
                          `items.${index}.total`,
                          +newTotal.toFixed(2)
                        );
                      }}
                      precision={2}
                      min={0.01}
                      step={1}
                      hideControls
                      autoComplete="off"
                      autoFocus={true}
                      required
                    />
                    {values.items[index].cantidad < 0.1 &&
                      ValidIco({ mensaje: "La cantidad debe ser mayor a 0.1" })}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="txtProducto"
                      disabled={row.disable.item}
                      name={`items.${index}.item`}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= 15) {
                          changeValue(`items.${index}.item`, newValue);
                        }
                      }}
                      autoComplete="off"
                      value={values.items[index].item}
                      required
                    />
                  </td>
                  <td className="tADescription">
                    <div className="contentDes">
                      <div className="textarea-container">
                        <textarea
                          rows={1}
                          id={`items.${index}.descripcion`}
                          name={`items.${index}.descripcion`}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Verifica si el valor actual contiene el check "✔"
                            const hasCheck = inputValue.includes("✔ ");

                            // Si no hay un check y hay un texto, agrega el check automáticamente
                            const updatedValue = hasCheck
                              ? inputValue
                              : inputValue
                              ? "✔ " + inputValue
                              : "";

                            changeValue(
                              `items.${index}.descripcion`,
                              updatedValue
                            );
                            changeValue(`items.${index}.expanded`, true);

                            handleTextareaHeight(e.target);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();

                              // Añade el check de "✔" al texto existente
                              const updatedValue = `${values.items[index].descripcion}\n✔ `;
                              changeValue(
                                `items.${index}.descripcion`,
                                updatedValue
                              );

                              changeValue(`items.${index}.expanded`, true);
                              const scrollHeight = event.target.scrollHeight;
                              event.target.style.height = `${
                                scrollHeight + 30
                              }px`;
                            }
                          }}
                          disabled={row.disable.descripcion}
                          value={values.items[index].descripcion}
                          className={`${
                            values.items[index].expanded ? "expanded" : ""
                          }`}
                        />
                        <div
                          className="expand-button"
                          onClick={() => {
                            changeValue(
                              `items.${index}.expanded`,
                              !values.items[index].expanded
                            );

                            handleScrollTop(`items.${index}.descripcion`);
                          }}
                        >
                          {values.items[index].expanded ? (
                            <i className="fa-solid fa-chevron-up" />
                          ) : (
                            <i className="fa-solid fa-chevron-down" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <NumberInput
                      name={`items.${index}.total`}
                      className="txtTotal"
                      disabled={row.disable.total}
                      value={+values.items[index].total}
                      formatter={(value) => formatThousandsSeparator(value)}
                      onChange={(value) => {
                        changeValue(`items.${index}.total`, value);
                      }}
                      precision={2}
                      min={0}
                      step={1}
                      hideControls
                      autoComplete="off"
                      required
                    />
                  </td>
                  <td
                    className="space-action"
                    onClick={() => {
                      if (
                        (!iEdit || iEdit?.estado === "reservado") &&
                        values.items[index].identificador !== iDelivery?._id
                      ) {
                        const updatedItems = [...values.items];
                        updatedItems.splice(index, 1);
                        changeValue("items", updatedItems);
                      }
                    }}
                  >
                    {row.disable.action ? null : (
                      <Eliminar className="delete-row" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ marginTop: "10px" }}>
                <td>
                  {iCliente &&
                  Object.keys(iCliente).length > 0 &&
                  values.modoDescuento === "Puntos" ? (
                    <div className="input-number dsc">
                      <NumberInput
                        value={+values.cargosExtras.beneficios.puntos}
                        label={`Descuento x Puntos -  Max(${iCliente.scoreTotal})`}
                        description={`Por cada ${iPuntos.score} puntos -  ${simboloMoneda} ${iPuntos.valor} de descuento`}
                        max={parseInt(iCliente?.scoreTotal)}
                        formatter={(value) => formatThousandsSeparator(value)}
                        min={0}
                        step={1}
                        hideControls={true}
                        onChange={(e) => {
                          const data = iCliente?.scoreTotal < e ? false : true;
                          changeValue(
                            "cargosExtras.descuentos.puntos",
                            data ? Number(MontoxPoints(e).toFixed(2)) : 0
                          );
                          changeValue("cargosExtras.beneficios.puntos", e);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ position: "absolute" }}>
                      {iCliente ? (
                        <>
                          <label>
                            Total de Puntos : ( {iCliente?.scoreTotal} )
                          </label>
                          <br />
                          <span>
                            Por cada {iPuntos.score} puntos - {simboloMoneda}{" "}
                            {iPuntos.valor} de descuento
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}
                </td>
                <td>Subtotal :</td>
                <td>{formatThousandsSeparator(values.subTotal, true)}</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                {values.factura ? (
                  <>
                    <td>
                      {nameImpuesto} ({values.cargosExtras.igv.valor * 100} %) :
                    </td>
                    <td>
                      {simboloMoneda} {values.cargosExtras.igv.importe}
                    </td>
                  </>
                ) : (
                  <>
                    <td></td>
                    <td></td>
                  </>
                )}

                <td></td>
              </tr>
              <tr>
                <td></td>
                {values.onDescuento ? (
                  <>
                    <td>Descuento x ({values.modoDescuento})</td>
                    <td>{formatThousandsSeparator(values.descuento, true)}</td>
                  </>
                ) : null}

                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>Total :</td>
                <td>{formatThousandsSeparator(values.totalNeto, true)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          {error.items && touched.items && (
            <div className="error-message">{error.items}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoServicios;
