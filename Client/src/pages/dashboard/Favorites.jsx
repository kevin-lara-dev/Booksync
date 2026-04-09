import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";

import { getFavorites, deleteFavorite } from "../../services/favorito.service";
import { createReserva } from "../../services/reserva.service";

function Favorites() {
  const navigate = useNavigate();
  const { toast, openToast } = useLogoutToast();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastReserva, setToastReserva] = useState({
    show: false,
    title: "",
    msg: "",
  });

  //reserva
  const showToast = (title, msg) => {
    setToastReserva({ show: true, title, msg });
    setTimeout(
      () => setToastReserva({ show: false, title: "", msg: "" }),
      3000,
    );
  };

  const handleReservar = async (idLibro) => {
    try {
      const res = await createReserva(idLibro);

      // Actualiza la cantidad disponible del libro en el estado local
      setFavorites((prev) =>
        prev.map((l) =>
          l.id_libro === idLibro
            ? { ...l, available_quantity: l.available_quantity - 1 }
            : l,
        ),
      );

      showToast("Reserva", res.message || "Reserva creada correctamente");
    } catch (error) {
      showToast(
        "Error",
        error?.response?.data?.message || "Error al crear la reserva",
      );
    }
  };

  //detalle
  const handleDetalle = (idLibro) => {
    navigate(`/detalle/${idLibro}`);
  };

  //quitar favorito
  const handleQuitarFavorito = async (idLibro) => {
    try {
      await deleteFavorite(idLibro);
      setFavorites((prev) => prev.filter((l) => l.id_libro !== idLibro));
    } catch (error) {
      alert(error?.response?.data?.message || "Error quitando favorito");
    }
  };

  //llamada de favoritos
  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const data = await getFavorites();

        setFavorites(data.favorite || []);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavs();
  }, []);

  //renderizar disponibles
  const renderDisponibilidad = (status, availableQty) => {
    if (status === "inactivo")
      return (
        <p className="favorito-row">
          <span className="label">Inactivo</span>
        </p>
      );
    if (status === "dañado")
      return (
        <p className="favorito-row">
          <span className="label">Dañado</span>
        </p>
      );

    if (availableQty > 0) {
      return (
        <p className="favorito-row">
          <span className="label">Disponible para reservar</span>
        </p>
      );
    }
    return (
      <p className="favorito-row">
        <span className="label">Sin disponibilidad</span>
      </p>
    );
  };

  return (
    <div className="favoritos-page">
      <div className="app layout">
        <Sidebar onLogout={openToast} />

        <main className="favoritos-content">
          {/* HEADER */}
          <header className="favoritos-header">
            <div className="badge-mis-favoritos">
              <span className="badge-icon">
                <i className="fa-solid fa-book-open" />
              </span>
              <div className="badge-text">
                <span>Mis</span>
                <span>favoritos</span>
              </div>
            </div>
          </header>

          {/* Lista de favoritos */}
          <section className="favoritos-panel">
            {loading && <p>Cargando favoritos...</p>}

            {!loading && favorites.length === 0 && (
              <p>
                No tienes favoritos todavía. Ve al detalle de un libro y
                guárdalo ⭐
              </p>
            )}
            <div className="favoritos-grid">
              {favorites.map((libro) => {
                const coverUrl = `http://localhost:3000${libro.cover}`;

                return (
                  <article key={libro.id_libro} className="favorito-card">
                    {/* Corazon flotante */}
                    <button
                      type="button"
                      className="favorito like"
                      onClick={() => handleQuitarFavorito(libro.id_libro)}
                      aria-label="Quitar de favoritos"
                    >
                      <i className="fa-solid fa-heart" />
                    </button>

                    {/* Portada */}
                    <div className="favorito-cover">
                      <img src={coverUrl} alt={libro.title} />
                    </div>

                    {/* Info */}
                    <div className="favorito-info">
                      <h3 className="favorito-title">
                        {libro.title} <span>({libro.author})</span>
                      </h3>

                      {renderDisponibilidad(
                        libro.status,
                        libro.available_quantity,
                      )}
                      <p className="favorito-row genero">{libro.genre}</p>
                    </div>

                    {/* Botones */}
                    <div className="favorito-footer">
                      <button
                        type="button"
                        className={`btn-favorito-reservar ${
                          libro.available_quantity <= 0 ||
                          libro.status !== "disponible"
                            ? "btn-no-disponible"
                            : ""
                        }`}
                        onClick={() => handleReservar(libro.id_libro)}
                        disabled={
                          libro.available_quantity <= 0 ||
                          libro.status !== "disponible"
                        }
                      >
                        {libro.available_quantity > 0 &&
                        libro.status === "disponible"
                          ? "Reservar"
                          : "No disponible"}
                      </button>

                      <button
                        type="button"
                        className="btn-favorito-detalle"
                        onClick={() => handleDetalle(libro.id_libro)}
                      >
                        Detalle
                      </button>
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
          {toast}
        </main>
      </div>
    </div>
  );
}

export default Favorites;
