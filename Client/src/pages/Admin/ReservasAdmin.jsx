import React, { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import {
  getReservasAdmin,
  confirmReservaAdmin,
  cancelReservaAdmin,
} from "../../services/reserva.service";

const ITEMS_POR_PAGINA = 10;

function ReservasAdmin() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [toastReserva, setToastReserva] = useState({
    show: false,
    title: "",
    msg: "",
  });
  const { toast, openToast } = useLogoutToast();

  const showToast = (title, msg) => {
    setToastReserva({ show: true, title, msg });
    setTimeout(
      () => setToastReserva({ show: false, title: "", msg: "" }),
      3000,
    );
  };

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const data = await getReservasAdmin();
      setReservas(data.reservas || []);
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error cargando reservas",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  // Resetear página al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [search]);

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getUsuario = (res) => {
    const nombreCompleto = `${res.nombre || ""} ${res.apellido || ""}`.trim();
    return nombreCompleto || res.correo || "Usuario no disponible";
  };

  const getEstadoTipo = (estado) => {
    const map = {
      activa: "warning",
      confirmada: "ok",
      cancelada: "danger",
      expirada: "danger",
      prestada: "ok",
    };
    return map[estado] || "warning";
  };

  const getEstadoTexto = (estado) => {
    const map = {
      activa: "Vigente",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      expirada: "Expirada",
      prestada: "Prestada",
    };
    return map[estado] || estado;
  };

  const reservasFiltradas = useMemo(() => {
    if (!search.trim()) return reservas;
    const term = search.toLowerCase();
    return reservas.filter((res) =>
      [res.isbn, res.title, res.author, getUsuario(res), res.correo, res.estado]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [reservas, search]);

  // Paginado
  const totalPaginas = Math.ceil(reservasFiltradas.length / ITEMS_POR_PAGINA);

  const reservasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return reservasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [reservasFiltradas, paginaActual]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const visibleIds = reservasPaginadas.map((r) => r.id_reserva);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const noneVisibleSelected = visibleIds.every(
    (id) => !selectedIds.includes(id),
  );
  const isIndeterminate = !noneVisibleSelected && !allVisibleSelected;
  const selectAllRef = useRef(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = (event) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        visibleIds.forEach((id) => set.add(id));
        return Array.from(set);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  const handleConfirmarReserva = async (idReserva) => {
    try {
      const res = await confirmReservaAdmin(idReserva);
      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === idReserva
            ? {
                ...r,
                estado: "confirmada",
                confirmed_at: new Date().toISOString(),
              }
            : r,
        ),
      );
      showToast("Reserva", res.message || "Reserva confirmada correctamente");
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error confirmando reserva",
      );
    }
  };

  const handleCancelarReserva = async (idReserva) => {
    try {
      const res = await cancelReservaAdmin(idReserva);
      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === idReserva
            ? {
                ...r,
                estado: "cancelada",
                cancelled_at: new Date().toISOString(),
              }
            : r,
        ),
      );
      showToast("Reserva", res.message || "Reserva cancelada correctamente");
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error cancelando reserva",
      );
    }
  };

  const handleConfirmarSeleccionadas = async () => {
    if (selectedIds.length === 0) {
      showToast("Aviso", "No hay reservas seleccionadas.");
      return;
    }
    const reservasActivas = reservas.filter(
      (r) => selectedIds.includes(r.id_reserva) && r.estado === "activa",
    );
    if (reservasActivas.length === 0) {
      showToast("Aviso", "Solo puedes confirmar reservas activas.");
      return;
    }
    await Promise.all(
      reservasActivas.map((r) => handleConfirmarReserva(r.id_reserva)),
    );
    setSelectedIds([]);
  };

  const handleCancelarSeleccionadas = async () => {
    if (selectedIds.length === 0) {
      showToast("Aviso", "No hay reservas seleccionadas.");
      return;
    }
    const reservasActivas = reservas.filter(
      (r) => selectedIds.includes(r.id_reserva) && r.estado === "activa",
    );
    if (reservasActivas.length === 0) {
      showToast("Aviso", "Solo puedes cancelar reservas activas.");
      return;
    }
    await Promise.all(
      reservasActivas.map((r) => handleCancelarReserva(r.id_reserva)),
    );
    setSelectedIds([]);
  };

  const handleNuevaReserva = () =>
    showToast("Aviso", "Esta acción se puede implementar después.");
  const handleHistorial = () =>
    showToast("Aviso", "Esta acción se puede implementar después.");
  const handleExportar = () =>
    showToast("Aviso", "Esta acción se puede implementar después.");

  const renderEstadoPill = (reserva) => (
    <span
      className={`res-estado-pill res-estado-pill--${getEstadoTipo(reserva.estado)}`}
    >
      <span className="res-estado-dot" />
      <span className="res-estado-text">{getEstadoTexto(reserva.estado)}</span>
    </span>
  );

  return (
    <div className="reservas-admin-page">
      <div className="reservas-admin-layout">
        <Sidebar onLogout={openToast} />

        <main className="reservas-admin-main">
          <section className="reservas-admin-panel">
            <header className="reservas-admin-header">
              <div className="reservas-admin-title-block">
                <h1 className="reservas-admin-title">Reservas</h1>
                <span className="reservas-admin-counter">
                  {reservasFiltradas.length}
                </span>
              </div>

              <div className="reservas-admin-header-actions">
                <button
                  type="button"
                  className="res-btn res-btn--primary"
                  onClick={handleNuevaReserva}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  <span>Nueva reserva</span>
                </button>
                <button
                  type="button"
                  className="res-btn res-btn--ghost"
                  onClick={handleHistorial}
                >
                  <i className="fa-regular fa-clock" aria-hidden="true" />
                  <span>Historial</span>
                </button>
                <button
                  type="button"
                  className="res-btn res-btn--ghost"
                  onClick={handleExportar}
                >
                  <i className="fa-solid fa-file-export" aria-hidden="true" />
                  <span>Exportar</span>
                </button>
              </div>
            </header>

            <div className="reservas-admin-search-row">
              <div className="reservas-admin-search">
                <span className="search-icon">
                  <i className="fa-solid fa-magnifying-glass" />
                </span>
                <input
                  type="text"
                  placeholder="Título, autor, ISBN o usuario"
                  value={search}
                  onChange={handleSearchChange}
                />
                <button
                  type="button"
                  className="search-voice"
                  aria-label="Búsqueda por voz"
                >
                  <i className="fa-solid fa-microphone" />
                </button>
              </div>
            </div>

            <div className="reservas-admin-filters-row">
              <button type="button" className="res-chip">
                <i className="fa-solid fa-user" />
                <span>Usuario</span>
                <i className="fa-solid fa-chevron-down" />
              </button>
              <button type="button" className="res-chip">
                <i className="fa-solid fa-toggle-on" />
                <span>Estado</span>
                <i className="fa-solid fa-chevron-down" />
              </button>
              <button type="button" className="res-chip">
                <i className="fa-solid fa-calendar-day" />
                <span>Fecha</span>
                <i className="fa-solid fa-chevron-down" />
              </button>
              <button type="button" className="res-chip">
                <i className="fa-solid fa-layer-group" />
                <span>Categoría</span>
                <i className="fa-solid fa-chevron-down" />
              </button>
            </div>

            <div className="reservas-admin-table-wrapper">
              <table className="reservas-admin-table">
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todas"
                        ref={selectAllRef}
                        checked={allVisibleSelected}
                        onChange={handleToggleAll}
                      />
                    </th>
                    <th>Portada</th>
                    <th>Código / ISBN</th>
                    <th>Título</th>
                    <th>Usuario</th>
                    <th>Fecha reserva</th>
                    <th>Fecha límite de retiro</th>
                    <th className="col-estado">Estado</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="no-results">
                        Cargando reservas...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    reservasPaginadas.map((res) => (
                      <tr key={res.id_reserva}>
                        <td className="col-checkbox">
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar reserva de ${getUsuario(res)}`}
                            checked={selectedIds.includes(res.id_reserva)}
                            onChange={() => handleToggleRow(res.id_reserva)}
                          />
                        </td>
                        <td>
                          {res.cover && (
                            <img
                              src={`http://localhost:3000${res.cover}`}
                              alt={res.title}
                              width="40"
                              style={{ borderRadius: "4px" }}
                            />
                          )}
                        </td>
                        <td>{res.isbn || "Sin ISBN"}</td>
                        <td>{res.title}</td>
                        <td>{getUsuario(res)}</td>
                        <td>{formatDate(res.fecha_reserva)}</td>
                        <td>{formatDate(res.expires_at)}</td>
                        <td className="col-estado">{renderEstadoPill(res)}</td>
                        <td className="col-actions">
                          {res.estado === "activa" ? (
                            <>
                              <button
                                type="button"
                                className="row-action"
                                title="Confirmar reserva"
                                onClick={() =>
                                  handleConfirmarReserva(res.id_reserva)
                                }
                              >
                                <i className="fa-solid fa-check" />
                              </button>
                              <button
                                type="button"
                                className="row-action"
                                title="Cancelar reserva"
                                onClick={() =>
                                  handleCancelarReserva(res.id_reserva)
                                }
                              >
                                <i className="fa-solid fa-xmark" />
                              </button>
                            </>
                          ) : res.estado === "confirmada" ? (
                            <span title="Lista para crear préstamo">
                              <i className="fa-solid fa-book-open-reader" />
                            </span>
                          ) : (
                            <span title="Sin acciones disponibles">
                              <i className="fa-solid fa-minus" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                  {!loading && reservasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="no-results">
                        {search
                          ? `No se encontraron reservas para "${search}".`
                          : "No hay reservas disponibles."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINADO */}
            {totalPaginas > 1 && (
              <div className="reservas-admin-pagination">
                <button
                  type="button"
                  className="pag-btn"
                  onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                  disabled={paginaActual === 1}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      className={`pag-btn ${paginaActual === num ? "pag-btn--active" : ""}`}
                      onClick={() => setPaginaActual(num)}
                    >
                      {num}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="pag-btn"
                  onClick={() =>
                    setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                  }
                  disabled={paginaActual === totalPaginas}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>

                <span className="pag-info">
                  Página {paginaActual} de {totalPaginas}
                </span>
              </div>
            )}

            <footer className="reservas-admin-footer">
              <div className="reservas-admin-bulk-actions">
                <button
                  type="button"
                  className="res-btn res-btn--primary"
                  onClick={handleConfirmarSeleccionadas}
                >
                  <i className="fa-regular fa-square-check" />
                  <span>Confirmar reservas</span>
                </button>
                <button
                  type="button"
                  className="res-btn res-btn--ghost"
                  onClick={handleCancelarSeleccionadas}
                >
                  <i className="fa-regular fa-circle-xmark" />
                  <span>Cancelar</span>
                </button>
              </div>
            </footer>
          </section>

          <div
            className={"reserve-toast" + (toastReserva.show ? "" : " hidden")}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              <i
                className={`fa-solid ${toastReserva.title === "Error" ? "fa-circle-xmark" : "fa-circle-check"}`}
              />
              <div>
                <p className="toast-title">{toastReserva.title}</p>
                <p className="toast-msg">{toastReserva.msg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setToastReserva({ show: false, title: "", msg: "" })
              }
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {toast}
        </main>
      </div>
    </div>
  );
}

export default ReservasAdmin;
