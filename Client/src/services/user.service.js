import api from "./api";

// Trae todos los usuarios del sistema. Solo disponible para administradores.
export const getAllUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

// Activa o desactiva un usuario. El estado que llegue ("activo" / "inactivo") es el que se aplica.
export const changeUserStatus = async (id, estado) => {
  const { data } = await api.patch(`/users/${id}/status`, { estado });
  return data;
};

// Cambia el rol de un usuario entre "usuario" y "administrador"
export const changeUserRole = async (id, tipo) => {
  const { data } = await api.patch(`/users/${id}/role`, { tipo });
  return data;
};

// Trae los datos de perfil del usuario logueado (sin contraseña)
export const getProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data;
};

// Actualiza los datos del perfil. Solo se envían los campos que cambiaron; los demás no se tocan.
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/users/profile", profileData);
  return data;
};

// Cambia la contraseña. Requiere la contraseña actual para confirmar que es el propio usuario quien lo solicita.
export const changePassword = async (passwordActual, passwordNueva) => {
  const { data } = await api.patch("/users/profile/password", { passwordActual, passwordNueva });
  return data;
};

// Desactiva la cuenta del usuario logueado. Es un soft delete: el registro permanece en la base de datos.
export const deleteProfile = async () => {
  const { data } = await api.delete("/users/profile");
  return data;
};
