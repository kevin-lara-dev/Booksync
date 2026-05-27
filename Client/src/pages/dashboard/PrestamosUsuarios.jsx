import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { getMisPrestamos } from "../../services/prestamo.service";

function PrestamosUsuarios() {
  const { toast, openToast } = useLogoutToast();

  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ show: false, title: "", msg: "" });

  const showToast = (title, msg) => {
    setToastMsg({ show: true, title, msg });
    setTimeout(() => setToastMsg({ show: false, title: "", msg: "" }), 3000);
  };

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const data = await getMisPrestamos();
        setPrestamos(data.prestamos || []);
      } catch (error) {
        showToast("Error", error?.response?.data?.message || "Error cargando préstamos");
        setPrestamos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Si el préstamo está activo y vence en 2 días o menos → "próximo a vencer"
  const getDisplayEstado = (prestamo) => {
    if (prestamo.estado !== "activo") return prestamo.estado;
    const diasRestantes =
      (new Date(prestamo.fecha_devolucion) - new Date()) / (1000 * 60 * 60 * 24);
    return diasRestantes <= 2 ? "proximo" : "activo";
  };

  const getBadgeClass = (displayEstado) => {
    const map = {
      activo: "badge-vigente",
      proximo: "badge-proximo",
      vencido: "badge-atrasado",
      devuelto: "badge-devuelto",
    };
    return map[displayEstado] || "badge-vigente";
  };

  const getBadgeText = (displayEstado) => {
    const map = {
      activo: "Vigente",
      proximo: "Próximo a vencer",
      vencido: "Vencido",
      devuelto: "Devuelto",
    };
    return map[displayEstado] || displayEstado;
  };

  const renderEstado = (prestamo) => {
    const display = getDisplayEstado(prestamo);

    switch (display) {
      case "activo":
      case "proximo":
        return (
          <>
            <p className="prestamo-row">
              <span className="label">Prestado el:</span>{" "}
              {formatDate(prestamo.fecha_prestamo)}
            </p>
            <p className="prestamo-row">
              <span className="label">Devolver antes del:</span>{" "}
              {formatDate(prestamo.fecha_devolucion)}
            </p>
          </>
        );

      case "vencido":
        return (
          <>
            <p className="prestamo-row">
              <span className="label">Prestado el:</span>{" "}
              {formatDate(prestamo.fecha_prestamo)}
            </p>
            <p className="prestamo-row">
              <span className="label">Venció el:</span>{" "}
              {formatDate(prestamo.fecha_devolucion)}
            </p>
          </>
        );

      case "devuelto":
        return (
          <>
            <p className="prestamo-row">
              <span className="label">Prestado el:</span>{" "}
              {formatDate(prestamo.fecha_prestamo)}
            </p>
            <p className="prestamo-row">
              <span className="label">Devuelto el:</span>{" "}
              {formatDate(prestamo.fecha_devolucion_real)}
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="prestamos-page">
      <div className="app-layout">
        <Sidebar onLogout={openToast} />

        <main className="prestamos-content">
          <header className="prestamos-header">
            <div className="badge-mis-prestamos">
              <span className="badge-icon">
                <i className="fa-solid fa-book-open" />
              </span>
              <div className="badge-text">
                <span>Mis</span>
                <span>préstamos</span>
              </div>
            </div>
          </header>

          <section className="prestamos-panel">
            {loading && (
              <p className="prestamos-loading">Cargando préstamos...</p>
            )}

            {!loading && prestamos.length === 0 && (
              <p className="prestamos-empty">No tienes préstamos todavía.</p>
            )}

            <div className="prestamos-grid">
              {prestamos.map((prestamo) => {
                const display = getDisplayEstado(prestamo);
                const portada = `http://localhost:3000${prestamo.cover}`;

                return (
                  <article key={prestamo.id_prestamo} className="prestamo-card">
                    <div className="prestamo-cover">
                      <img src={portada} alt={prestamo.title} />
                    </div>

                    <div className="prestamo-info">
                      <h3 className="prestamo-title">
                        {prestamo.title} <span>({prestamo.author})</span>
                      </h3>

                      {renderEstado(prestamo)}
                    </div>

                    <div className="prestamo-footer">
                      <span className={`badge-estado ${getBadgeClass(display)}`}>
                        {getBadgeText(display)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div
            className={"reserve-toast" + (toastMsg.show ? "" : " hidden")}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              <i
                className={`fa-solid ${
                  toastMsg.title === "Error" ? "fa-circle-xmark" : "fa-circle-check"
                }`}
              />
              <div>
                <p className="toast-title">{toastMsg.title}</p>
                <p className="toast-msg">{toastMsg.msg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg({ show: false, title: "", msg: "" })}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </main>

        {toast}
      </div>
    </div>
  );
}

export default PrestamosUsuarios;
