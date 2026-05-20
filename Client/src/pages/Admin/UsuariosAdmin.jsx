import React, { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import {
  getAllUsers,
  changeUserStatus,
  changeUserRole,
} from "../../services/user.service";
import Swal from "sweetalert2";

function UsuariosAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [actionLoading, setActionLoading] = useState(null);

  const { toast, openToast } = useLogoutToast();

  // ── Cargar usuarios ───────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Cambiar estado ────────────────────────────────────────────
  const handleChangeStatus = async (user) => {
    const nuevoEstado = user.estado === "activo" ? "inactivo" : "activo";
    setActionLoading(user.id_usuario);
    try {
      await changeUserStatus(user.id_usuario, nuevoEstado);
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === user.id_usuario ? { ...u, estado: nuevoEstado } : u,
        ),
      );
    } catch (err) {
      Swal.fire({
        text: "Error al cambiar estado del usuario.",
        icon: "error",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#fff",
        iconColor: "#e74c3c",
        customClass: { popup: "burbuja-mini", icon: "icono-pequeno" },
      });
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Cambiar rol ───────────────────────────────────────────────
  const handleChangeRole = async (user) => {
    const nuevoRol = user.tipo === "usuario" ? "administrador" : "usuario";

    const { isConfirmed } = await Swal.fire({
      title: "¿Cambiar rol?",
      text: `${user.nombre} pasará a ser "${nuevoRol}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      background: "#fef6e1",
      color: "#2b1b0b",
      confirmButtonColor: "#bd8e39",
      cancelButtonColor: "#9e8c78",
      customClass: { popup: "swal-confirm-booksync" },
    });
    if (!isConfirmed) return;

    setActionLoading(user.id_usuario);
    try {
      await changeUserRole(user.id_usuario, nuevoRol);
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === user.id_usuario ? { ...u, tipo: nuevoRol } : u,
        ),
      );
      Swal.fire({
        text: `Rol actualizado a "${nuevoRol}".`,
        icon: "success",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#fff",
        iconColor: "#2ecc71",
        customClass: { popup: "burbuja-mini", icon: "icono-pequeno" },
      });
    } catch (err) {
      Swal.fire({
        text: "Error al cambiar rol del usuario.",
        icon: "error",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#fff",
        iconColor: "#e74c3c",
        customClass: { popup: "burbuja-mini", icon: "icono-pequeno" },
      });
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtros ───────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = users;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((u) =>
        [u.nombre, u.apellido, u.correo].join(" ").toLowerCase().includes(term),
      );
    }

    if (roleFilter !== "todos") {
      result = result.filter((u) => u.tipo === roleFilter);
    }

    if (statusFilter !== "todos") {
      result = result.filter((u) => u.estado === statusFilter);
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="users-admin-page">
      <div className="users-admin-layout">
        <Sidebar onLogout={openToast} />

        <main className="users-admin-main">
          <section className="users-admin-panel">
            <header className="users-admin-header">
              <h1 className="users-admin-title">Usuarios</h1>
            </header>

            {/* Búsqueda */}
            <div className="users-admin-search-row">
              <div className="users-admin-search">
                <span className="search-icon">
                  <i className="fa-solid fa-magnifying-glass" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="users-admin-filters-row">
              <button
                type="button"
                className="users-chip"
                onClick={() =>
                  setRoleFilter((prev) =>
                    prev === "todos" ? "administrador" : "todos",
                  )
                }
              >
                <i className="fa-solid fa-filter" />
                <span>Tipo</span>
                <span className="chip-value">
                  {roleFilter === "todos" ? "Todos" : roleFilter}
                </span>
                <i className="fa-solid fa-chevron-down" />
              </button>

              <button
                type="button"
                className="users-chip"
                onClick={() =>
                  setStatusFilter((prev) =>
                    prev === "todos" ? "activo" : "todos",
                  )
                }
              >
                <i className="fa-solid fa-chevron-down" />
                <span>Estado</span>
                <span className="chip-value">
                  {statusFilter === "todos" ? "Todos" : statusFilter}
                </span>
                <i className="fa-solid fa-chevron-down" />
              </button>
            </div>

            {/* Estados de carga y error */}
            {loading && (
              <p style={{ padding: "2rem", textAlign: "center" }}>
                Cargando usuarios...
              </p>
            )}

            {error && (
              <p style={{ padding: "2rem", textAlign: "center", color: "red" }}>
                {error}
              </p>
            )}

            {/* Grid */}
            {!loading && !error && (
              <div className="users-admin-grid">
                {filteredUsers.map((user) => {
                  const isActive = user.estado === "activo";
                  const isLoading = actionLoading === user.id_usuario;
                  const roleLabel =
                    user.tipo === "administrador"
                      ? "Administrador"
                      : user.tipo === "bibliotecario"
                        ? "Bibliotecario"
                        : "Usuario";

                  return (
                    <article key={user.id_usuario} className="user-card">
                      <header className="user-card__header">
                        <span className="user-card__name">{user.nombre}</span>

                        {/* Menú de acciones */}
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="user-card__menu"
                            title={isActive ? "Desactivar" : "Activar"}
                            disabled={isLoading}
                            onClick={() => handleChangeStatus(user)}
                          >
                            <i
                              className={
                                isActive
                                  ? "fa-solid fa-user-slash"
                                  : "fa-solid fa-user-check"
                              }
                            />
                          </button>

                          <button
                            type="button"
                            className="user-card__menu"
                            title="Cambiar rol"
                            disabled={isLoading}
                            onClick={() => handleChangeRole(user)}
                          >
                            <i className="fa-solid fa-arrows-rotate" />
                          </button>
                        </div>
                      </header>

                      <div className="user-card__avatar">
                        <i className="fa-regular fa-user" />
                      </div>

                      <div className="user-card__body">
                        <p className="user-card__full-name">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="user-card__role">({roleLabel})</p>
                        <p style={{ fontSize: "0.75rem", color: "#888" }}>
                          {user.correo}
                        </p>

                        <div className="user-card__status-row">
                          <span
                            className={
                              "user-status-pill " +
                              (isActive
                                ? "user-status-pill--ok"
                                : "user-status-pill--danger")
                            }
                          >
                            <span className="user-status-dot" />
                            <span className="user-status-text">
                              {user.estado}
                            </span>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="users-admin-empty">
                    No se encontraron usuarios para esa búsqueda.
                  </div>
                )}
              </div>
            )}

            <footer className="users-admin-footer">
              <button
                type="button"
                className="users-btn users-btn--primary"
                onClick={fetchUsers}
              >
                <i className="fa-solid fa-rotate" />
                <span>Recargar</span>
              </button>
            </footer>
          </section>
          {toast}
        </main>
      </div>
    </div>
  );
}

export default UsuariosAdmin;
