import api from "./api";

// Listar todos los usuarios (solo admin)
export const getAllUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

// Cambiar estado del usuario
export const changeUserStatus = async (id, estado) => {
  const { data } = await api.patch(`/users/${id}/status`, { estado });
  return data;
};

// Cambiar rol del usuario
export const changeUserRole = async (id, tipo) => {
  const { data } = await api.patch(`/users/${id}/role`, { tipo });
  return data;
};

//obtener perfil
export const getProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data;
};

//actualizar perfil
export const updateProfile = async (profileData) => {
  const { data } = await api.put("/users/profile", profileData);
  return data;
};

//cambiar contraseña
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.patch("/users/profile/password", {
    currentPassword,
    newPassword,
  });
  return data;
};

//eliminar perfil
export const deleteProfile = async () => {
  const { data } = await api.delete("/users/profile");
  return data;
};
