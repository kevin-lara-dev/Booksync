import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordRequest } from "../../services/auth.service";
import { useToast } from "../../hooks/useToast";

function ForgotPassword() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // llamo al back — siempre responde 200, no revela si el correo existe o no
      await forgotPasswordRequest(correo);

      // navego a la pantalla de confirmación pasando el correo pa mostrárselo al usuario
      navigate("/forgot", { state: { email: correo } });

    } catch (error) {
      showToast("Error", "No se pudo procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrap">
      <div className="login-inner">
        <div className="login-brand">
          <img src="BOOKSYNC LOGO 2.png" alt="Logo BOOKSYNC" />
        </div>

        <section className="login-card" role="dialog" aria-labelledby="forgot-title" aria-modal="true">
          <div className="avatar">
            <i className="fa-regular fa-envelope" />
          </div>

          <p style={{ textAlign: "center", marginBottom: "8px", fontSize: "0.9rem" }}>
            Escribe tu <strong>correo registrado</strong> y te enviaremos un <strong>enlace</strong> para crear una <strong>nueva contraseña</strong>.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: "14px" }}>
            <div className="form-row">
              <label className="label" htmlFor="correo">
                Correo electrónico
              </label>
              <div className="field">
                <input
                  id="correo"
                  type="email"
                  placeholder="Escriba su correo registrado"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div className="meta">
              <span />
              <button className="btn-login" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </div>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
              <Link to="/Help">¿Necesitas ayuda?</Link>
            </div>
          </form>
        </section>
      </div>
      {toast}
    </main>
  );
}

export default ForgotPassword;
