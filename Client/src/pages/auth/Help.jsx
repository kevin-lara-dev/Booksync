import { Link } from "react-router-dom";
import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";

const Help = () => {
  const { toast, showToast } = useToast();
  const form = useRef();
  const { currentUser } = useAuth();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT,
        form.current,
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        },
      )
      .then(() => {
        showToast("Listo", "Mensaje enviado con éxito");
        form.current.reset();
      })
      .catch(() => {
        showToast("Error", "No se pudo enviar el mensaje");
      });
  };

  return (
    <main className="login-wrap help-page">
      {/* Logo */}
      <div className="login-inner">
        <div className="login-brand">
          <img src="BOOKSYNC LOGO 2.png" alt="Logo BOOKSYNC" />
        </div>

        <section
          className="login-card help-card"
          role="dialog"
          aria-labelledby="help-title"
          aria-modal="true"
        >
          <div className="avatar">
            <i className="fa-regular fa-circle-question" />
          </div>

          <header className="help-header">
            <h1 id="help-title">¿Necesitas ayuda?</h1>
            <p>
              Aquí puedes resolver dudas sobre tu cuenta, el acceso al sistema o
              el uso de la biblioteca.
            </p>
          </header>

          <div className="help-grid">
            {/* Columna izquierda: accesos rápidos */}
            <div className="help-quik">
              <h2>Accesos rapidos</h2>
              <ul>
                <li>
                  <strong>
                    Problemas para iniciar sesión:verifica tu correo y
                    contraseña. Si no recuerdas la contraseña, usa{" "}
                  </strong>
                  <span className="tag">“Olvidé mi contraseña”</span>
                </li>
                <li>
                  <strong>Cuenta bloqueada:</strong> comunícate con el personal
                  de biblioteca para validar tu identidad.
                </li>
              </ul>

              <div className="help-chanels">
                <h3>Canales de contacto</h3>
                <p>
                  <i className="fa-regular fa-envelope" />{" "}
                  kevinesteven0627@gmail.com
                </p>
                <p>
                  <i className="fa-solid fa-phone" /> 3124046821 – Soporte de
                  ayuda BookSync
                </p>
              </div>
            </div>

            {/* Columna derecha: formulario de contacto */}

            <div className="help-form">
              <h2>Envianos un mensaje</h2>
              <form ref={form} onSubmit={sendEmail}>
                <input
                  type="hidden"
                  name="name"
                  value={currentUser?.nombre || ""}
                />
                <input
                  type="hidden"
                  name="email"
                  value={currentUser?.correo || ""}
                />
                <div className="form-row">
                  <label htmlFor="topic">Tema</label>
                  <select name="topic" id="topic" required>
                    <option value="">Seleciona una opcion</option>
                    <option value="access">Problemas de acceso</option>
                    <option value="account">Datos de mi cuenta</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="form-row">
                  <label htmlFor="message">Cuentanos que sucede</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Describe brevemente el problema..."
                    required
                  />
                </div>

                <div className="form-row chekbox-row">
                  <label>
                    <input type="checkbox" required /> Autorizo el uso de mis
                    datos para contactarme y dar respuesta a mi solicitud.
                  </label>
                </div>

                <button type="submit" className="btn-login">
                  Enviar solicitud
                </button>
              </form>
            </div>
          </div>

          <footer className="help-footer">
            <Link to="/" className="link">
              Volver al inicio de sesión
            </Link>
          </footer>
        </section>
      </div>
      {toast}
    </main>
  );
};

export default Help;
