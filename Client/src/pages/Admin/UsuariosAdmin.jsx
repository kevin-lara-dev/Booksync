import { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "../../components/sidebar";
import { useLogoutToast } from "../../hooks/useLogoutToast";
import { useToast } from "../../hooks/useToast";
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
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  const { toast: logoutToast, openToast } = useLogoutToast();
  const { toast: feedbackToast, showToast } = useToast();

  // Carga todos los usuarios del sistema al montar el componente
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Alterna el estado del usuario entre "activo" e "inactivo" y actualiza la lista local
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
      showToast("Error", "Error al cambiar estado del usuario.");
    } finally {
      setActionLoading(null);
    }
  };

  // Pide confirmación antes de cambiar el rol del usuario entre "usuario" y "administrador"
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
      showToast("Listo", `Rol actualizado a "${nuevoRol}".`);
    } catch (err) {
      showToast("Error", "Error al cambiar rol del usuario.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtra los usuarios en memoria según búsqueda, rol y estado seleccionados
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

  // Vuelve a la primera página cuando cambia la búsqueda o los filtros, para no quedarse en una página sin resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Genera y descarga un archivo CSV con los usuarios que están visibles según los filtros activos
  const handleExportUsers = () => {
    if (filteredUsers.length === 0) {
      showToast("Aviso", "No hay usuarios para exportar");
      return;
    }

    const headers = ["nombre", "apellido", "correo", "tipo", "estado", "tipo_documento", "numero_documento"];

    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((u) => headers.map((h) => escape(u[h])).join(",")),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_booksync_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="users-admin-page">
      <div className="users-admin-layout">
        <Sidebar onLogout={openToast} />

        <main className="users-admin-main">
          <section className="users-admin-panel">
            <header className="users-admin-header">
              <h1 className="users-admin-title">Usuarios</h1>

              <div className="users-admin-header-actions">
                <button type="button" className="users-btn users-btn--primary" onClick={handleExportUsers}>
                  <i className="fa-solid fa-file-export" aria-hidden="true" />
                  <span>Exportar</span>
                </button>
              </div>
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
              <label className="users-chip">
                <i className="fa-solid fa-filter" />
                <select
                  className="users-chip-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="todos">Tipo: Todos</option>
                  <option value="usuario">Usuario</option>
                  <option value="administrador">Administrador</option>
                  <option value="bibliotecario">Bibliotecario</option>
                </select>
              </label>

              <label className="users-chip">
                <i className="fa-solid fa-toggle-on" />
                <select
                  className="users-chip-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            {/* Estados de carga y error */}
            {loading && (
              <p className="users-admin-empty">Cargando usuarios...</p>
            )}

            {error && (
              <p className="users-admin-empty users-admin-empty--error">{error}</p>
            )}

            {/* Grid */}
            {!loading && !error && (
              <div className="users-admin-grid">
                {paginatedUsers.map((user) => {
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

            {totalPages > 1 && (
              <div className="pagination" role="navigation" aria-label="Paginacion">
                <button
                  className="pagination-btn"
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Pagina anterior"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? "pagination-btn--active" : ""}`}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Pagina siguiente"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
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
          {logoutToast}
          {feedbackToast}
        </main>
      </div>
    </div>
  );
}

export default UsuariosAdmin;
