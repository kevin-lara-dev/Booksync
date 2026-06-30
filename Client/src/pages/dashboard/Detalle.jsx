import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { useToast } from "../../hooks/useToast";
import {
  isFavorite,
  addFavorite,
  deleteFavorite,
} from "../../services/favorito.service";
import { createReserva } from "../../services/reserva.service";
import { getLibroById } from "../../services/libro.service";
import Sidebar from "../../components/sidebar";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function Detalle() {
  const navigate = useNavigate();
  const { toast: logoutToast, openToast } = useLogoutToast();
  const { toast: shareToast, showToast } = useToast();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReserveToast, setShowReserveToast] = useState(false);

  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showFavToast, setShowFavToast] = useState(false);
  const [favToastMsg, setFavToastMsg] = useState("");
  const [reserveToastMsg, setReserveToastMsg] = useState("");
  const [reserveToastType, setReserveToastType] = useState("success");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // getLibroById usa api.js — token va automático por el interceptor
        const data = await getLibroById(id);
        setBook(data);

        const favRes = await isFavorite(id);
        setIsFav(Boolean(favRes.isFav));
      } catch (error) {
        navigate("/Home");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="detalle-page">
        <Sidebar onLogout={openToast} />
        <main className="content">
          <p>Cargando libro...</p>
        </main>
      </div>
    );
  }

  const statusMap = {
    disponible: "Disponible",
    prestado: "Prestado",
    dañado: "Dañado",
    inactivo: "Inactivo",
  };

  const formattedStatus = statusMap[book.status] || "Desconocido";
  if (!book) return null;
  const coverPath = `${SERVER_URL}${book.cover}`;

  const handleReserve = async () => {
    try {
      const res = await createReserva(id);

      setReserveToastType("success");
      setShowReserveToast(true);
      setReserveToastMsg(res.message || "Reservado exitosamente");

      setBook((prev) => ({
        ...prev,
        available_quantity: Math.max((prev.available_quantity || 1) - 1, 0),
      }));
    } catch (error) {
      setReserveToastType("error");
      setShowReserveToast(true);
      setReserveToastMsg(
        error?.response?.data?.message || "Error creando reserva",
      );
      setTimeout(() => setShowReserveToast(false), 3000);
    }
  };

  const handleFavorite = async () => {
    try {
      setFavLoading(true);
      if (isFav) {
        const res = await deleteFavorite(id);
        setIsFav(false);
        setFavToastMsg(res.message || "Eliminado de favoritos");
      } else {
        const res = await addFavorite(id);
        setIsFav(true);
        setFavToastMsg(res.message || "Agregado a favoritos");
      }
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 3000);
    } catch (error) {
      setFavToastMsg(error?.response?.data?.message || "Error con favoritos");
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 3000);
    } finally {
      setFavLoading(false);
    }
  };

  const handleCloseToast = () => {
    setShowReserveToast(false);
  };

  const handleShare = async () => {
    const url = window.location.href;

    // Web Share API disponible en mobile y algunos browsers de escritorio
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `${book.title} — ${book.author}`,
          url,
        });
      } catch (err) {
        // el usuario canceló el diálogo, no hago nada
      }
      return;
    }

    // fallback: copiar al portapapeles
    try {
      await navigator.clipboard.writeText(url);
      showToast("Enlace copiado", "El link del libro se copió al portapapeles");
    } catch (err) {
      showToast("Error", "No se pudo copiar el enlace");
    }
  };

  return (
    <div className="detalle-page">
      <Sidebar onLogout={openToast} />

      <main className="content detalle-content">
        <section className="detalle-card glass">
          <h2 className="highlight-title">
            {book.title} – {book.author}
          </h2>

          <div className="detalle-body">
            <div className="detalle-left">
              <img
                id="book-cover"
                src={coverPath}
                alt={`Portada: ${book.title}`}
              />

              <div className="buttons">
                <button
                  className="btn reserve"
                  type="button"
                  onClick={handleReserve}
                  disabled={book.available_quantity <= 0}
                >
                  {book.available_quantity > 0 ? "Reservar" : "No disponible"}
                </button>

                <button
                  className="btn fav"
                  type="button"
                  onClick={handleFavorite}
                  disabled={favLoading}
                >
                  {isFav ? "Quitar" : "Favorito"}
                </button>

                <button className="btn share" type="button" onClick={handleShare}>
                  Compartir
                </button>
              </div>
            </div>

            <div className="detalle-right">
              <div className="info">
                <p>
                  <strong>Título:</strong> <span>{book.title}</span>
                </p>
                <p>
                  <strong>Autor:</strong> <span>{book.author}</span>
                </p>
                <p>
                  <strong>Año:</strong> <span>{book.publication_year}</span>
                </p>
                <p>
                  <strong>Género:</strong> <span>{book.genre}</span>
                </p>
                <p>
                  <strong>Editorial:</strong> <span>{book.editorial}</span>
                </p>
                <p>
                  <strong>Estado:</strong> <span>{formattedStatus}</span>
                </p>
              </div>

              {book.description && (
                <div className="description">
                  <p>{book.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Toast de reserva */}
        <div
          className={"reserve-toast" + (showReserveToast ? "" : " hidden")}
          role="status"
          aria-live="polite"
        >
          <div className="toast-content">
            <i
              className={`fa-solid ${
                reserveToastType === "error"
                  ? "fa-circle-xmark"
                  : "fa-circle-check"
              }`}
            />

            <div>
              <p className="toast-title">Reservado</p>
              <p className="toast-msg">{reserveToastMsg}</p>
            </div>
          </div>

          <button type="button" onClick={handleCloseToast}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div
          className={"reserve-toast" + (showFavToast ? "" : " hidden")}
          role="status"
          aria-live="polite"
        >
          <div className="toast-content">
            <i className="fa-solid fa-circle-check" />
            <div>
              <p className="toast-title">Favoritos</p>
              <p className="toast-msg">{favToastMsg}</p>
            </div>
          </div>

          <button type="button" onClick={() => setShowFavToast(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </main>
      {logoutToast}
      {shareToast}
    </div>
  );
}

export default Detalle;
