import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerRequest } from "../../services/auth.service";
import { useToast } from "../../hooks/useToast";



function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    fecha_nacimiento: "",
    correo: "",
    password: "",
    passwordConfirmed: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { toast, showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      fecha_nacimiento,
      correo,
      password,
      passwordConfirmed,
    } = form;

    // Validaciones básicas
    if (
      !nombre ||
      !apellido ||
      !tipo_documento ||
      !numero_documento ||
      !fecha_nacimiento ||
      !correo ||
      !password ||
      !passwordConfirmed
    ) {
      showToast("Error", "Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      showToast("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== passwordConfirmed) {
      showToast("Error", "Las contraseñas no coinciden");
      return;
    }

    if (!/^\d+$/.test(numero_documento)) {
      showToast("Error", "El número de identificación debe contener solo dígitos.");
      return;
    }

    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();
    if (birthDate > today) {
      showToast("Error", "La fecha de nacimiento no puede ser futura.");
      return;
    }

    // conectar con el backend
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento,
        fecha_nacimiento: form.fecha_nacimiento,
        correo: form.correo,
        password: form.password,
      };

      await registerRequest(payload);

      showToast("Listo", "Registro exitoso. Ahora puedes iniciar sesión");

      setTimeout(() => {
        navigate("/Home");
      }, 2000);

    } catch (error) {
      console.error(error);
      showToast("Error", error.response?.data?.message || "Error al registrar el usuario");
    }
  };



  return (
    <main className="login-wrap register-page">
      <div className="login-inner">
        {/* Logo */}
        <div className="login-brand">
          <img src="BOOKSYNC LOGO 2.png" alt="BOOKSYNC" />
        </div>

        {/* Tarjeta registro */}
        <section
          className="login-card register-card"
          role="dialog"
          aria-labelledby="reg-title"
          aria-modal="true"
        >
          <div className="avatar">
            <i className="fa-solid fa-user-plus" />
          </div>

          <form
            id="register-form"
            onSubmit={handleSubmit}
            noValidate
            style={{ marginTop: 14 }}
          >
            <h2 id="reg-title" className="sr-only">
              Crear cuenta BookSync
            </h2>

            <div className="form-row">
              <label htmlFor="nombre">Nombres</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Escribe tus nombres"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="apellido">Apellidos</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                placeholder="Escribe tus apellidos"
                value={form.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="form-row id-section">
              <label htmlFor="numero_documento">Número de identificación</label>
              <div className="id-group">
                <input
                  type="text"
                  id="numero_documento"
                  name="numero_documento"
                  placeholder="Escribe tu número de identificación"
                  value={form.numero_documento}
                  onChange={handleChange}
                />

                <div className="id-type">
                  <label>
                    <input
                      type="radio"
                      name="tipo_documento"
                      value="CC"
                      checked={form.tipo_documento === "CC"}
                      onChange={handleChange}
                    />
                    {" "}C.C
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo_documento"
                      value="TI"
                      checked={form.tipo_documento === "TI"}
                      onChange={handleChange}
                    />
                    {" "}T.I
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
              <div className="field">
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                />
                <i className="fa-regular fa-calendar" />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="correo">Correo</label>
              <input
                type="email"
                id="correo"
                name="correo"
                placeholder="ejemplo@ejemplo.com"
                value={form.correo}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="password">Contraseña</label>
              <div className="field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Escribe tu contraseña"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={togglePassword}
                >
                  <i
                    className={
                      showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                    }
                  />
                </button>
              </div>
            </div>

            <div className="form-row">
                <label htmlFor="passwordConfirmed">Confirme su contraseña</label>
              <div className="field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="passwordConfirmed"
                  name="passwordConfirmed"
                  placeholder="Confirme su contraseña"
                  value={form.passwordConfirmed}
                  onChange={handleChange}
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={togglePassword}
                >
                <i
                  className={
                  showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                  }
                />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login">
              Registrarse
            </button>

            <div className="links">
              <Link to="/">¿Ya tienes cuenta?</Link>
              <Link to="/help">¿Necesitas ayuda?</Link>
            </div>
          </form>
        </section>
      </div>
      {toast}
    </main>
  );
}

export default Register;
