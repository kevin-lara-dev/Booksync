import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile,
} from "../../services/user.service";
import Swal from "sweetalert2";

function Account() {
  const { logout } = useAuth();
  const { toast: logoutToast, openToast } = useLogoutToast();
  const { toast: feedbackToast, showToast } = useToast();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    fecha_nacimiento: "",
    tipo_documento: "",
    numero_documento: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await getProfile();
        setPerfil(data);
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          fecha_nacimiento: data.fecha_nacimiento
            ? data.fecha_nacimiento.split("T")[0]
            : "",
          tipo_documento: data.tipo_documento || "",
          numero_documento: data.numero_documento || "",
        });
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      showToast("Listo", "Perfil actualizado correctamente");
    } catch (err) {
      showToast("Error", err?.response?.data?.message || "Error al actualizar perfil");
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      showToast("Error", "Completa todos los campos de contraseña");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      showToast("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwords.current, passwords.next);
      showToast("Listo", "Contraseña actualizada correctamente");
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      showToast("Error", err?.response?.data?.message || "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivate = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción desactivará tu cuenta permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      background: "#fef6e1",
      color: "#2b1b0b",
      confirmButtonColor: "#b31313",
      cancelButtonColor: "#9e8c78",
      customClass: { popup: "swal-confirm-booksync" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProfile();
        } catch (err) {
        } finally {
          logout();
        }
      }
    });
  };

  const avatarInitial = perfil?.nombre?.trim()?.charAt(0)?.toUpperCase() || "U";

  if (loading) return <p style={{ padding: "2rem" }}>Cargando perfil...</p>;

  return (
    <div className="account-page">
      <div className="account-layout">
        <Sidebar onLogout={openToast} />
        <div className="account-main">
          <div className="account-page__inner">
            <div className="account-page__panel">

              {/* HEADER */}
              <header className="account-header">
                <h1 className="account-header__title">CUENTA</h1>
                <div className="account-header__row">
                  <div className="account-header__avatar">
                    <div className="account-avatar-circle">
                      <span>{avatarInitial}</span>
                    </div>
                  </div>
                  <div className="account-header__user-block">
                    <div className="account-header__user-top">
                      <span className="account-header__user-label">Usuario</span>
                      <input
                        className="account-header__user-input"
                        type="text"
                        value={perfil?.correo || ""}
                        disabled
                      />
                    </div>
                    <div className="account-header__chips">
                      <span className="account-chip account-chip--role">
                        {perfil?.tipo?.toUpperCase() || "USUARIO"}
                      </span>
                      <span className="account-chip account-chip--status">
                        {perfil?.estado?.toUpperCase() || "ACTIVO"}
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              {/* CUERPO */}
              <main className="account-body">

                {/* IZQUIERDA — datos personales */}
                <section className="account-left">
                  <div className="account-section-label">DATOS GUARDADOS</div>
                  <form className="account-form" onSubmit={handleSubmit}>
                    <div className="account-form__field">
                      <label htmlFor="nombre">Nombre</label>
                      <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} />
                    </div>
                    <div className="account-form__field">
                      <label htmlFor="apellido">Apellido</label>
                      <input id="apellido" name="apellido" type="text" value={formData.apellido} onChange={handleChange} />
                    </div>
                    <div className="account-form__field">
                      <label htmlFor="correo">Correo</label>
                      <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} />
                    </div>
                    <div className="account-form__field">
                      <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                      <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} />
                    </div>
                    <div className="account-form__field">
                      <label htmlFor="numero_documento">Número de identificación</label>
                      <input id="numero_documento" name="numero_documento" type="text" value={formData.numero_documento} onChange={handleChange} />
                    </div>
                    <div className="account-form__actions">
                      <button type="submit" className="account-btn account-btn--primary">
                        <i className="fa-solid fa-floppy-disk" /> Guardar cambios
                      </button>
                    </div>
                  </form>
                </section>

                {/* DERECHA — sesión + seguridad */}
                <section className="account-right">

                  {/* Card sesión activa */}
                  <div className="account-devices-card">
                    <h2 className="account-devices__title">Sesión activa</h2>
                    <p className="account-devices__subtitle">Estás conectado en este dispositivo.</p>
                    <div className="account-devices__actions">
                      <button type="button" className="account-btn account-btn--dark" onClick={openToast}>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>

                  {/* Card seguridad — contraseña */}
                  <div className="account-security-card">
                    <div className="account-security-card__header">
                      <i className="fa-solid fa-shield-halved account-security-card__icon" />
                      <h2 className="account-security-card__title">Seguridad</h2>
                    </div>
                    <form className="account-security-form" onSubmit={handleSubmitPassword}>
                      <div className="account-form__field">
                        <label htmlFor="current-pw">Contraseña actual</label>
                        <input id="current-pw" name="current" type="password" value={passwords.current} onChange={handlePasswordChange} />
                      </div>
                      <div className="account-form__field">
                        <label htmlFor="next-pw">Nueva contraseña</label>
                        <input id="next-pw" name="next" type="password" value={passwords.next} onChange={handlePasswordChange} />
                      </div>
                      <div className="account-form__field">
                        <label htmlFor="confirm-pw">Confirmar contraseña</label>
                        <input id="confirm-pw" name="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} />
                      </div>
                      <div className="account-form__actions">
                        <button type="submit" className="account-btn account-btn--primary" disabled={savingPassword}>
                          <i className="fa-solid fa-key" />
                          {savingPassword ? " Guardando..." : " Actualizar contraseña"}
                        </button>
                      </div>
                    </form>
                  </div>

                </section>
              </main>

              {/* ZONA DE PELIGRO */}
              <footer className="account-danger-zone">
                <button type="button" className="account-btn account-btn--danger" onClick={handleDeactivate}>
                  Solicitar desactivación
                </button>
              </footer>

            </div>
          </div>
        </div>
        {logoutToast}
        {feedbackToast}
      </div>
    </div>
  );
}

export default Account;
