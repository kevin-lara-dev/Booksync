import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";

const MANUALS = [
  { name: "Manual de Usuario", file: "/manuales/manual-usuario.pdf" },
  { name: "Manual Técnico de la Aplicación", file: "/manuales/manual-tecnico.pdf" },
  { name: "Plan de Capacitación a los Usuarios", file: "/manuales/plan-capacitacion.pdf" },
  { name: "Manual de Instalación y Configuración", file: "/manuales/manual-instalacion.pdf" },
  { name: "Plan de Validación de Características", file: "/manuales/plan-validacion.pdf" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showManuals, setShowManuals] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast, showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({
        correo: email,
        password,
      });

      // Todos los usuarios, sin importar el rol, llegan primero al catálogo. El admin accede al panel de gestión desde el sidebar.
      navigate("/Home");
    } catch {
      showToast("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <main className="login-wrap ">
      <div className="login-inner">
        <div className="login-brand">
          <img src="BOOKSYNC LOGO 2.png" alt="Logo BOOKSYNC" />
        </div>

        <section
          className="login-card"
          role="dialog"
          aria-labelledby="titulo-login"
          aria-modal="true"
        >
          <div className="manuals-toggle-wrap">
            <button
              type="button"
              className="manuals-toggle-btn"
              onClick={() => setShowManuals((prev) => !prev)}
              aria-label="Manuales y credenciales de prueba"
              title="Manuales y credenciales de prueba"
            >
              <i className="fa-solid fa-book-open" />
            </button>

            {showManuals && (
              <div className="manuals-panel">
                <div className="manuals-panel-header">
                  <span>Manuales</span>
                  <button
                    type="button"
                    className="manuals-panel-close"
                    onClick={() => setShowManuals(false)}
                    aria-label="Cerrar"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>

                <ul className="manuals-list">
                  {MANUALS.map((m) => (
                    <li key={m.file}>
                      <a href={m.file} target="_blank" rel="noopener noreferrer">
                        <span>{m.name}</span>
                        <i className="fa-solid fa-file-pdf" />
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="manuals-credentials">
                  Usuario de prueba: <strong>kevin@booksync.com</strong> · Clave: <strong>123456</strong>
                </p>
              </div>
            )}
          </div>

          <div className="avatar">
            <i className="fa-solid fa-user" />
          </div>

          <form
            id="login-form"
            onSubmit={handleSubmit}
            style={{ marginTop: "14px" }}
          >
            <div className="form-row">
              <label className="label" htmlFor="email">
                Correo
              </label>
              <div className="field">
                <input
                  id="email"
                  type="email"
                  placeholder="Escriba su correo"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <div className="field">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Escriba su contraseña"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle"
                  aria-label="Mostrar contraseña"
                  onClick={() => setShowPw((prev) => !prev)}
                >
                  <i
                    id="pw-icon"
                    className={
                      showPw ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                    }
                  />
                </button>
              </div>
            </div>

            <div className="meta">
              <label>
                <input type="checkbox" /> Recuérdame
              </label>
              <button className="btn-login" type="submit">
                Iniciar sesión
              </button>
            </div>

            <div className="links">
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
              <Link to="/Help">¿Necesitas ayuda?</Link>
              <Link to="/Register">¿No tienes cuenta?</Link>
            </div>
          </form>
        </section>
      </div>
      {toast}
    </main>
  );
}

export default Login;
