import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { useToast } from "../../hooks/useToast";
import {
  getPrestamosAdmin,
  devolverPrestamo,
} from "../../services/prestamo.service";

const ITEMS_POR_PAGINA = 10;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function PrestamosAdmin() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const { toast: logoutToast, openToast } = useLogoutToast();
  const { toast: feedbackToast, showToast } = useToast();

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const data = await getPrestamosAdmin();
      setPrestamos(data.prestamos || []);
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error cargando préstamos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

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

  const getUsuario = (p) =>
    `${p.nombre || ""} ${p.apellido || ""}`.trim() ||
    p.correo ||
    "Usuario no disponible";

  const getEstadoTipo = (estado) => {
    const map = { activo: "ok", vencido: "danger", devuelto: "warning" };
    return map[estado] || "warning";
  };

  const getEstadoTexto = (estado) => {
    const map = { activo: "Activo", vencido: "Vencido", devuelto: "Devuelto" };
    return map[estado] || estado;
  };

  const prestamosFiltrados = useMemo(() => {
    if (!search.trim()) return prestamos;
    const term = search.toLowerCase();
    return prestamos.filter((p) =>
      [p.title, p.author, getUsuario(p), p.correo, p.estado]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [prestamos, search]);

  const totalPaginas = Math.ceil(prestamosFiltrados.length / ITEMS_POR_PAGINA);

  const prestamosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return prestamosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [prestamosFiltrados, paginaActual]);

  const handleDevolver = async (idPrestamo) => {
    try {
      const res = await devolverPrestamo(idPrestamo);
      setPrestamos((prev) =>
        prev.map((p) =>
          p.id_prestamo === idPrestamo
            ? {
                ...p,
                estado: "devuelto",
                fecha_devolucion_real: new Date().toISOString(),
              }
            : p,
        ),
      );
      showToast("Préstamo", res.message || "Devolución registrada correctamente");
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error registrando devolución",
      );
    }
  };

  const renderEstadoPill = (p) => (
    <span
      className={`res-estado-pill res-estado-pill--${getEstadoTipo(p.estado)}`}
    >
      <span className="res-estado-dot" />
      <span className="res-estado-text">{getEstadoTexto(p.estado)}</span>
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
                <h1 className="reservas-admin-title">Préstamos</h1>
                <span className="reservas-admin-counter">
                  {prestamosFiltrados.length}
                </span>
              </div>

              <div className="reservas-admin-header-actions">
                <button
                  type="button"
                  className="res-btn res-btn--ghost"
                  onClick={cargarPrestamos}
                >
                  <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                  <span>Actualizar</span>
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
                  placeholder="Título, autor, usuario o estado"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="reservas-admin-table-wrapper">
              <table className="reservas-admin-table">
                <thead>
                  <tr>
                    <th>Portada</th>
                    <th>Título</th>
                    <th>Usuario</th>
                    <th>Fecha préstamo</th>
                    <th>Fecha devolución</th>
                    <th>Devuelto el</th>
                    <th className="col-estado">Estado</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} className="no-results">
                        Cargando préstamos...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    prestamosPaginados.map((p) => (
                      <tr key={p.id_prestamo}>
                        <td>
                          {p.cover && (
                            <img
                              src={`${SERVER_URL}${p.cover}`}
                              alt={p.title}
                              width="40"
                              style={{ borderRadius: "4px" }}
                            />
                          )}
                        </td>
                        <td>{p.title}</td>
                        <td>
                          <div>{getUsuario(p)}</div>
                          <small style={{ color: "var(--color-muted, #888)" }}>
                            {p.correo}
                          </small>
                        </td>
                        <td>{formatDate(p.fecha_prestamo)}</td>
                        <td>{formatDate(p.fecha_devolucion)}</td>
                        <td>{formatDate(p.fecha_devolucion_real)}</td>
                        <td className="col-estado">{renderEstadoPill(p)}</td>
                        <td className="col-actions">
                          {p.estado === "activo" || p.estado === "vencido" ? (
                            <button
                              type="button"
                              className="row-action"
                              title="Registrar devolución"
                              onClick={() => handleDevolver(p.id_prestamo)}
                            >
                              <i className="fa-solid fa-rotate-left" />
                            </button>
                          ) : (
                            <span title="Ya devuelto">
                              <i className="fa-solid fa-check" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                  {!loading && prestamosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="no-results">
                        <div className="table-empty-state">
                          <i className={`table-empty-icon fa-solid ${search ? "fa-magnifying-glass" : "fa-hand-holding-heart"}`} />
                          <p className="table-empty-title">
                            {search ? `Sin resultados para "${search}"` : "No hay préstamos registrados"}
                          </p>
                          <p className="table-empty-sub">
                            {search ? "Intenta con otro término de búsqueda." : "Los préstamos se crean desde la gestión de reservas."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
          </section>

          {feedbackToast}
          {logoutToast}
        </main>
      </div>
    </div>
  );
}

export default PrestamosAdmin;
