import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordRequest } from "../../services/auth.service";
import { useToast } from "../../hooks/useToast";

function Reset() {
  const navigate = useNavigate();
  const { token } = useParams(); // leo el token directamente de la URL
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validaciones locales antes de llamar al back
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // mando el token (de la URL) y la nueva contraseña al back
      await resetPasswordRequest(token, form.password);

      showToast("Listo", "Contraseña actualizada correctamente");

      // espero un momento pa que el usuario vea el toast y luego mando al login
      setTimeout(() => navigate("/"), 2000);

    } catch (error) {
      const msg = error?.response?.data?.message || "El enlace no es válido o ya expiró";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrap reset-page">
      <div className="login-inner">
        <div className="login-brand">
          <img src="BOOKSYNC LOGO 2.png" alt="BOOKSYNC" />
        </div>

        <section className="login-card reset-card">
          <div className="avatar">
            <i className="fa-regular fa-user" />
          </div>

          <header className="reset-header">
            <h1>Crear una nueva contraseña</h1>
            <p>
              Al finalizar este paso automáticamente <br />
              ingresarás a BookSync
            </p>
          </header>

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Escriba su nueva contraseña"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-row">
              <label htmlFor="confirmPassword">Confirme su contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirme su nueva contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {error && <p className="reset-error">{error}</p>}

            <button className="btn-reset" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Continuar"}
            </button>
          </form>
        </section>
      </div>
      {toast}
    </main>
  );
}

export default Reset;
