import api from "./api";

// manda correo y password al back, recibe { token, user }
export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// manda todos los campos del formulario de registro al back
export const registerRequest = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// manda el correo al back, el back decide si existe o no y manda el email
export const forgotPasswordRequest = async (correo) => {
  const response = await api.post("/auth/forgot-password", { correo });
  return response.data;
};

// el token va en la URL porque el back lo definió como :token en la ruta, no en el body
export const resetPasswordRequest = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};
