import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await login({
        correo: email,
        password,
      });

      navigate("/Home");
    } catch (err) {
      Swal.fire({
        text: "Correo o contraseña incorrectos",
        icon: "error",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#fff",
        iconColor: "#e74c3c",
        customClass: {
          popup: "burbuja-mini",
          icon: "icono-pequeno",
        },
      });
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
              <Link to="/Forgot">¿Olvidaste tu contraseña?</Link>
              <Link to="/Help">¿Necesitas ayuda?</Link>
              <Link to="/Register">¿No tienes cuenta?</Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;
