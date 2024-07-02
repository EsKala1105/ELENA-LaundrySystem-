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
  mode,
  paso,
  descripcion,
  changeValue,
  iCliente,
  values,
  onDescuento,
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
    const subtotal = Number(calculateTotalNeto(values.Items).toFixed(2));
    changeValue("subTotal", subtotal);
  }, [values.Items]);

  return (
    <div className="info-servicios">
      <div className="title">
        <h1>PASO {paso}</h1>
        <h2>{descripcion}</h2>
      </div>
      <div className="body">
        <div className="actions">
          {mode !== "UPDATE" ? (
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
                        listenClick={() => {
                          changeValue("Items", [
                            ...values.Items,
                            addRowGarment(IService?._id),
                          ]);
                        }}
                      />
                    );
                  })
                : null}
            </div>
          ) : null}

          <InputSelectedPrenda
            disabled={mode === "UPDATE"}
            listenClick={(info) => {
              changeValue("Items", [...values.Items, addRowGarment(info)]);
            }}
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
              {values.Items.map((row, index) => (
                <tr key={index}>
                  <td>
                    <NumberInput
                      name={`items.${index}.cantidad`}
                      className="txtCantidad"
                      disabled={row.disable.cantidad}
                      value={+values.Items[index].cantidad || ""}
                      formatter={(value) => formatThousandsSeparator(value)}
                      onChange={(value) => {
                        const price = values.Items[index].price || 0;
                        const newTotal = value * price;
                        changeValue(`Items.${index}.cantidad`, value);
                        changeValue(
                          `Items.${index}.total`,
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
                    {values.Items[index].cantidad < 0.1 &&
                      ValidIco({ mensaje: "La cantidad debe ser mayor a 0.1" })}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="txtProducto"
                      disabled={row.disable.item}
                      name={`Items.${index}.item`}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= 15) {
                          changeValue(`Items.${index}.item`, newValue);
                        }
                      }}
                      autoComplete="off"
                      value={values.Items[index].item}
                      required
                    />
                  </td>
                  <td className="tADescription">
                    <div className="contentDes">
                      <div className="textarea-container">
                        <textarea
                          rows={1}
                          id={`Items.${index}.descripcion`}
                          name={`Items.${index}.descripcion`}
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
                              `Items.${index}.descripcion`,
                              updatedValue
                            );
                            changeValue(`Items.${index}.expanded`, true);

                            handleTextareaHeight(e.target);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();

                              // Añade el check de "✔" al texto existente
                              const updatedValue = `${values.Items[index].descripcion}\n✔ `;
                              changeValue(
                                `Items.${index}.descripcion`,
                                updatedValue
                              );

                              changeValue(`Items.${index}.expanded`, true);
                              const scrollHeight = event.target.scrollHeight;
                              event.target.style.height = `${
                                scrollHeight + 30
                              }px`;
                            }
                          }}
                          disabled={row.disable.descripcion}
                          value={values.Items[index].descripcion}
                          className={`${
                            values.Items[index].expanded ? "expanded" : ""
                          }`}
                        />
                        <div
                          className="expand-button"
                          onClick={() => {
                            changeValue(
                              `Items.${index}.expanded`,
                              !values.Items[index].expanded
                            );

                            handleScrollTop(`items.${index}.descripcion`);
                          }}
                        >
                          {values.Items[index].expanded ? (
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
                      name={`Items.${index}.total`}
                      className="txtTotal"
                      disabled={row.disable.total}
                      value={+values.Items[index].total}
                      formatter={(value) => formatThousandsSeparator(value)}
                      onChange={(value) => {
                        changeValue(`Items.${index}.total`, value);
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
                        values.Items[index].identificador !== iDelivery?._id &&
                        mode !== "UPDATE"
                      ) {
                        const updatedItems = [...values.Items];
                        updatedItems.splice(index, 1);
                        changeValue("Items", updatedItems);
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
                {mode !== "UPDATE" ? (
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
                          disabled={mode === "UPDATE"}
                          hideControls={true}
                          onChange={(e) => {
                            const data =
                              iCliente?.scoreTotal < e ? false : true;
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
                ) : (
                  <td></td>
                )}
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
                {onDescuento ? (
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
          {error.Items && touched.Items && (
            <div className="error-message">{error.Items}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoServicios;
