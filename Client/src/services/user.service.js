import api from "./api";

// todos los usuarios — solo admin
export const getAllUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

// activar o desactivar un usuario
export const changeUserStatus = async (id, estado) => {
  const { data } = await api.patch(`/users/${id}/status`, { estado });
  return data;
};

// cambiar rol entre "usuario" y "administrador"
export const changeUserRole = async (id, tipo) => {
  const { data } = await api.patch(`/users/${id}/role`, { tipo });
  return data;
};

// mis datos de perfil (sin contraseña)
export const getProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data;
};

// actualizar mis datos — solo mando los que cambiaron
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/users/profile", profileData);
  return data;
};

// cambio de contraseña — requiere la actual pa confirmar que soy yo
export const changePassword = async (passwordActual, passwordNueva) => {
  const { data } = await api.patch("/users/profile/password", { passwordActual, passwordNueva });
  return data;
};

// desactivar mi cuenta (soft delete)
export const deleteProfile = async () => {
  const { data } = await api.delete("/users/profile");
  return data;
};
