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

  // Ocultar reservas canceladas después de 7 días
  const esCanceladaReciente = (reserva) => {
    if (reserva.estado !== "cancelada" && reserva.estado !== "expirada")
      return true;

    const fechaCancelacion = new Date(reserva.fecha_reserva);
    const ahora = new Date();
    const diffDias = (ahora - fechaCancelacion) / (1000 * 60 * 60 * 24);

    return diffDias <= 7;
  };

  //Cargar reserva
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await getReservas(); // ← faltaba esta línea
        const reservasFiltradas = (data.reservas || []).filter(
          esCanceladaReciente,
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

  const showToast = (title, msg) => {
    setToastReserva({ show: true, title, msg });
    setTimeout(
      () => setToastReserva({ show: false, title: "", msg: "" }),
      3000,
    );
  };

  //Borrar reserva
  const handleCancelar = async (idReserva) => {
    try {
      const res = await deleteReserva(idReserva);

      setReservas((prev) =>
        prev
          .map((r) =>
            r.id_reserva === idReserva ? { ...r, estado: "cancelada" } : r,
          )
          .filter(esCanceladaReciente),
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
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  //renderizar estado de reserva en base al caso
  const renderEstado = (estado, expiresAt) => {
    switch (estado) {
      case "activa":
        return (
          <>
            <p className="reserva-row">
              <span className="label">Estado:</span> Activa
            </p>
            <p className="reserva-row">
              <span className="label">Recoger antes de:</span>{" "}
              {formatDate(expiresAt)}
            </p>
          </>
        );

      case "confirmada":
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> Confirmada
          </p>
        );

      case "cancelada":
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> Cancelada
          </p>
        );

      case "expirada":
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> Expirada
          </p>
        );

      case "prestada":
        return (
          <p className="reserva-row">
            <span className="label">Estado:</span> Prestamo
          </p>
        );

      default:
        return null;
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
                        <span className="label">Reservado:</span>{" "}
                        {formatDate(reserva.fecha_reserva)}
                      </p>

                      {renderEstado(reserva.estado, reserva.expires_at)}
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
                          {reserva.estado}
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
        </main>

        {toast}
      </div>
    </div>
  );
}

export default ReservasUsuario;
