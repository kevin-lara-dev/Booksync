import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { getLibrosRequest, getGenres } from "../../services/libro.service";

// URL base del server pa las portadas — va de .env pa no tenerla hardcodeada
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";


function Home() {
  const navigate = useNavigate();
  
  // ==== Estado búsqueda ====
  const [query, setQuery] = useState("");
  const [libros, setLibros] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [genres, setGenres] = useState([]);

  // ==== Estado carrusel ====
  const [currentIndex, setCurrentIndex] = useState(0); 
  const trackRef = useRef(null);
  
  // ==== Hook de logout (toast global) ====
  const { toast, openToast } = useLogoutToast();

  // ==== Función para obtener libros desde la API ====
  const fetchLibros = async (search = "") => {
    try {
      const data = await getLibrosRequest({
        title: search,
        genre: selectedGenre,
        sort: sortField,
        order: sortOrder,
      });
      setLibros(data.libros || []);
    } catch (error) {}
  }
  
  // ==== Lógica de búsqueda ====
  useEffect(() => {
    const delay = setTimeout(() => {
      if(query.trim().length === 0 ){
        setLibros([])
        setShowResults(false);
        return ;
      }

      fetchLibros(query);
      setShowResults(true);
    }, 400)

    return () => clearTimeout(delay);
  }, [query, selectedGenre, sortField, sortOrder]);

// === Obtener libros recientes para el carrusel ====
  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const data = await getLibrosRequest();
        const sorted = (data.libros || []).sort((a, b) => b.id_libro - a.id_libro).slice(0, 8);
        setRecentBooks(sorted);
        setCurrentIndex(0);
      } catch (error) {}
    }
    fetchRecentBooks();
  }, []);


  /// ==== Auto-rotación del carrusel ==== DISEÑO
  useEffect(() => {
  if (recentBooks.length === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      (prev + 1) % recentBooks.length
    );
  }, 4000); // 4 segundos

  return () => clearInterval(interval);
}, [recentBooks]);



  // ==== Scroll del carrusel cuando cambia el índice ====
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[currentIndex];
    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  // ==== ordenamiento de genero  ====
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres || []);
      } catch (error) {}
    }
    fetchGenres();
  }, [])



  const handlePrev = () => {
    if (recentBooks.length === 0) return;
    setCurrentIndex((prev) =>
      (prev - 1 + recentBooks.length) % recentBooks.length
    );
  };

  const handleNext = () => {
    if (recentBooks.length === 0) return;
    setCurrentIndex((prev) =>
      (prev + 1) % recentBooks.length
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleCardClick = (book) => {
    localStorage.setItem("selectedBook", JSON.stringify(book));
    navigate(`/detalle/${book.id_libro}`);
  };


  return (
    <div className="home-page">
      {/* ===== Sidebar ===== */}
      <Sidebar onLogout={openToast}/>

      {/* ===== Contenido ===== */}
      <main className="content">
        {/* Barra de búsqueda */}
        <div className="search-wrap">
          <div className="search" role="search" aria-label="Buscar en catálogo">
            <i className="fa-solid fa-magnifying-glass prefix" />
            <input
              id="q"
              type="search"
              placeholder="Título, autor o ISBN"
              autoComplete="off"
              aria-controls="resultsArea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ===== Destacados (carrusel) ===== */}
        {!showResults && recentBooks.length > 0 && (
          <section
            id="spotlight"
            className="featured"
            aria-label="Libros destacados"
          >
            <div className="carousel">
              <button
                className="nav spot-nav prev"
                aria-label="Anterior"
                type="button"
                onClick={handlePrev}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              <div id="track" className="track" tabIndex="-1" ref={trackRef}>
                {recentBooks.map((book, index) => (
                  <article
                    key={book.id_libro}
                    className={`card ${
                      index === currentIndex ? "active" : ""
                    }`}
                    onClick={() => handleCardClick(book)}
                  >
                    <figure className="cover">
                      <img src={`${SERVER_URL}${book.cover}`} alt={`Portada de ${book.title}`} />
                    </figure>
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">({book.author})</div>
                  </article>
                ))}
              </div>

              <button
                className="nav spot-nav next"
                aria-label="Siguiente"
                type="button"
                onClick={handleNext}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>

            {/* Dots */}
            <div id="dots" className="dots" aria-hidden="true">
              {recentBooks.map((_, index) => (
                <button
                  key={index}
                  className={`dot cap ${
                    index === currentIndex ? "is-active" : ""
                  }`}
                  aria-selected={index === currentIndex ? "true" : "false"}
                  type="button"
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ===== Resultados de búsqueda ===== */}
        <section
          id="resultsArea"
          className="results-area"
          hidden={!showResults}
          aria-live="polite"
        >
          <div className="filters">

            <div className="filter-group">
              <label>Categoría</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">Todas</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="title">Título</option>
                <option value="author">Autor</option>
                <option value="publication_year">Año</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Orden</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="ASC">Ascendente</option>
                <option value="DESC">Descendente</option>
              </select>
            </div>

            <button
              className="clear-btn"
              onClick={() => {
                setSelectedGenre("");
                setSortField("title");
                setSortOrder("ASC");

                fetchLibros(query);
              }}
            >
              Limpiar
            </button>

          </div>

          <div id="results" className="results-grid" aria-label="Resultados">
            {libros.length === 0 ? (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#f0e6d0",
                  opacity: 0.9,
                  margin: "18px 0",
                }}
              >
                No encontramos resultados para "{query.trim()}".
              </p>
            ) : (
              libros.map((book) => (
                <article
                  key={book.id_libro}
                  className="result-card"
                  onClick={() => handleCardClick(book)}
                >
                  <figure>
                    <img
                      src={`${SERVER_URL}${book.cover}`} alt={`Portada de ${book.title}`}
                    />
                  </figure> 
                  <div className="rc-meta">
                    <h5>{book.title}</h5>
                    <small>({book.author})</small>
                  </div>
                </article>
              ))
            )}
          </div>

        </section>

        {/* ===== Toast: Cerrar sesión ===== */}
        {toast}
      </main>
    </div>
  );
}

export default Home;