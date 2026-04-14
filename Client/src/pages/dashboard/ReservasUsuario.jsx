import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { getReservas, deleteReserva } from "../../services/reserva.service";

function ReservasUsuario() {
  const { toast, openToast } = useLogoutToast();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastReserva, setToastReserva] = useState({
    show: false,
    title: "",
    msg: "",
  });

  const showToast = (title, msg) => {
    setToastReserva({ show: true, title, msg });

    setTimeout(() => {
      setToastReserva({ show: false, title: "", msg: "" });
    }, 3000);
  };

  // Mostrar canceladas/expiradas solo por 7 días más
  const esVisibleReciente = (reserva) => {
    if (!["cancelada", "expirada"].includes(reserva.estado)) {
      return true;
    }

    let fechaReferencia = null;

    if (reserva.estado === "cancelada") {
      fechaReferencia = reserva.cancelled_at;
    }

    if (reserva.estado === "expirada") {
      fechaReferencia = reserva.expires_at;
    }

    if (!fechaReferencia) return true;

    const fecha = new Date(fechaReferencia);
    const ahora = new Date();
    const diffDias = (ahora - fecha) / (1000 * 60 * 60 * 24);

    return diffDias <= 7;
  };

  //Cargar reserva
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await getReservas(); // ← faltaba esta línea
        const reservasFiltradas = (data.reservas || []).filter(
          esVisibleReciente,
        );
        setReservas(reservasFiltradas);
      } catch (error) {
        console.error("Error al cargar reservas: ", error);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  //Borrar reserva
  const handleCancelar = async (idReserva) => {
    try {
      const res = await deleteReserva(idReserva);

      const ahora = new Date().toISOString();

      setReservas((prev) =>
        prev
          .map((r) =>
            r.id_reserva === idReserva
              ? { ...r, estado: "cancelada", cancelled_at: ahora }
              : r,
          )
          .filter(esVisibleReciente),
      );

      showToast("Reserva", res.message || "Reserva cancelada correctamente");
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error cancelando reserva",
      );
    }
  };

  //fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";

    const date = new Date(dateString);
    return date.toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  //mapear estado a texto legible
  const getBadgeText = (estado) => {
    const map = {
      activa: "Activa",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      expirada: "Expirada",
      prestada: "Prestada",
    };

    return map[estado] || estado;
  };

  //renderizar estado de reserva en base al caso
  const renderEstado = (reserva) => {
    switch (reserva.estado) {
      case "activa":
        return (
          <>
            <p className="reserva-row">
              <span className="label">Estado:</span> Activa
            </p>
            <p className="reserva-row">
              <span className="label">Recoger antes de:</span>{" "}
              {formatDate(reserva.expires_at)}
            </p>
          </>
        );

      case "confirmada":
        return (
          <>
            <p className="reserva-row">
              <span className="label">Estado:</span> Confirmada
            </p>
            <p className="reserva-row">
              <span className="label">Confirmada el:</span>{" "}
              {formatDate(reserva.confirmed_at)}
            </p>
          </>
        );

      case "cancelada":
        return (
          <>
            <p className="reserva-row">
              <span className="label">Estado:</span> Cancelada
            </p>
            <p className="reserva-row">
              <span className="label">Cancelada el:</span>{" "}
              {formatDate(reserva.cancelled_at)}
            </p>
          </>
        );

      case "expirada":
        return (
          <>
            <p className="reserva-row">
              <span className="label">Estado:</span> Expirada
            </p>
            <p className="reserva-row">
              <span className="label">Venció el:</span>{" "}
              {formatDate(reserva.expires_at)}
            </p>
          </>
        );

      case "prestada":
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> Prestada
          </p>
        );

      default:
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> {reserva.estado}
          </p>
        );
    }
  };

  //Renderizar pagina
  return (
    <div className="reservas-page">
      <div className="app-layout">
        <Sidebar onLogout={openToast} />

        <main className="reservas-content">
          <header className="reservas-header">
            <div className="badge-mis-reservas">
              <span className="badge-icon">
                <i className="fa-solid fa-book-open" />
              </span>
              <div className="badge-text">
                <span>Mis</span>
                <span>reservas</span>
              </div>
            </div>
          </header>

          <section className="reservas-panel">
            {loading && (
              <p className="reservas-loading">Cargando reservas...</p>
            )}

            {!loading && reservas.length === 0 && (
              <p className="reservas-empty">No tienes reservas todavía.</p>
            )}

            <div className="reservas-grid">
              {reservas.map((reserva) => {
                const portada = `http://localhost:3000${reserva.cover}`;

                return (
                  <article key={reserva.id_reserva} className="reserva-card">
                    <div className="reserva-cover">
                      <img src={portada} alt={reserva.title} />
                    </div>

                    <div className="reserva-info">
                      <h3 className="reserva-title">
                        {reserva.title} <span>({reserva.author})</span>
                      </h3>

                      <p className="reserva-row">
                        <span className="label">Reservado el:</span>{" "}
                        {formatDate(reserva.fecha_reserva)}
                      </p>

                      {renderEstado(reserva)}
                    </div>

                    <div className="reserva-footer">
                      {reserva.estado === "activa" ? (
                        <button
                          type="button"
                          className="btn-cancelar-reserva"
                          onClick={() => handleCancelar(reserva.id_reserva)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <span
                          className={`badge-estado badge-${reserva.estado}`}
                        >
                          {getBadgeText(reserva.estado)}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div
            className={"reserve-toast" + (toastReserva.show ? "" : " hidden")}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              <i
                className={`fa-solid ${
                  toastReserva.title === "Error"
                    ? "fa-circle-xmark"
                    : "fa-circle-check"
                }`}
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
        </main>

        {toast}
      </div>
    </div>
  );
}

export default ReservasUsuario;
