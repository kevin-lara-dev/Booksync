import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback: si nadie pasó onLogout, navegar directo
      navigate("/");
    }
  };

  return (
    <aside className="sidebar">
      <Link className="brand" to="/Home" aria-label="Inicio">
        <img src="/BOOKSYNC LOGO 2.png" alt="BookSync" />
      </Link>

      <nav className="side-actions">
      <Link className="side-btn" title="Favoritos" to="/Favoritos">
          <i className="fa-solid fa-heart" />
          <small></small>
      </Link>

        <Link className="side-btn" title="Reservas" to="/Reservas">
          <i className="fa-solid fa-bookmark" />
          <small></small>
        </Link>

        <Link className="side-btn" title="Préstamos" to="/Prestamos">
          <i className="fa-solid fa-cart-shopping" />
          <small></small>
        </Link>
      </nav>

      {/* admin */}
      {isAdmin && (
        <nav className="side-actions side-actions--admin" aria-label="Secciones de administración">
          <Link className="side-btn" title="Gestión de inventario" to="/Admin/Inventario" >
            <i className="fa-solid fa-boxes-stacked" />
            <small></small>
          </Link>

          <Link className="side-btn" title="Gestión de reservas" to="/Admin/Reservas" >
            <i className="fa-solid fa-calendar-check" />
            <small></small>
          </Link>

          <Link className="side-btn" title="Gestión de usuarios" to="/Admin/Usuarios" >
            <i className="fa-solid fa-users-gear" />
            <small></small>
          </Link>
        </nav>
      )}


      <div className="side-tools">
        <Link className="tool" title="Cuenta" to="/Cuenta">
          <i className="fa-regular fa-user" />
          <small>Cuenta</small>
        </Link>

        <div className="side-tools__sep" />

        <button
          id="btn-logout"
          className="tool tool--logout"
          title="Salir"
          type="button"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-right-from-bracket" />
          <small>Salir</small>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
