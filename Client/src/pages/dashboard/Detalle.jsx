import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import {
  isFavorite,
  addFavorite,
  deleteFavorite,
} from "../../services/favorito.service";
import { createReserva } from "../../services/reserva.service";
import Sidebar from "../../components/sidebar";
import axios from "axios";

// Página de detalle del libro
function Detalle() {
  const navigate = useNavigate();
  const { toast, openToast } = useLogoutToast();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReserveToast, setShowReserveToast] = useState(false);

  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showFavToast, setShowFavToast] = useState(false);
  const [favToastMsg, setFavToastMsg] = useState("");
  const [reserveToastMsg, setReserveToastMsg] = useState("");

  // Obtener detalles del libro y estado de favorito al cargar el componente
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/api/libros/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBook(res.data);

        const favRes = await isFavorite(id);
        setIsFav(Boolean(favRes.isFav));
      } catch (error) {
        console.error("Error detalle:", error);
        navigate("/Home");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  // Mostrar mensaje de carga mientras se obtienen los datos
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

  // Mapear estados a texto legible
  const statusMap = {
    disponible: "Disponible",
    prestado: "Prestado",
    dañado: "Dañado",
    inactivo: "Inactivo",
  };

  // Obtener el texto formateado para el estado del libro
  const formattedStatus = statusMap[book.status] || "Desconocido";
  if (!book) return null;
  const coverPath = `http://localhost:3000${book.cover}`;

  // Función para manejar la reserva del libro
  const handleReserve = async () => {
    try {
      const res = createReserva(id);

      setShowReserveToast(true);
      setReserveToastMsg(res.message || "Reservado exitosamente");

      setBook((prev) => ({
        ...prev,
        available_quantity: prev.available_quantity - 1,
      }));

      setTimeout(() => setShowReserveToast(false), 3000);
    } catch (error) {
      setShowReserveToast(true);
      setReserveToastMsg(
        error?.response?.data?.message || "Error creando reserva",
      );
      setTimeout(() => setShowReserveToast(false), 3000);
    }
  };

  // Función para manejar la adición o eliminación de favoritos
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

  // Función para cerrar el toast de reserva
  const handleCloseToast = () => {
    setShowReserveToast(false);
  };

  // Renderizar el detalle del libro con opciones para reservar, agregar a favoritos y compartir
  return (
    <div className="detalle-page">
      {/* ===== Sidebar ===== */}
      <Sidebar onLogout={openToast} />

      {/* ===== Contenido del detalle ===== */}
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

                <button className="btn share" type="button">
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
            <i className="fa-solid fa-circle-check" />

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
      {toast}
    </div>
  );
}

export default Detalle;
