import api from "./api";

// Envía correo y contraseña al servidor. Si son correctos, recibe { token, user }.
export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Envía todos los campos del formulario de registro al servidor para crear la cuenta
export const registerRequest = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Envía el correo al servidor. El servidor decide si existe y, si es así, manda el email de recuperación.
export const forgotPasswordRequest = async (correo) => {
  const response = await api.post("/auth/forgot-password", { correo });
  return response.data;
};

// El token va en la URL porque el servidor lo definió como parámetro de ruta (:token), no en el cuerpo de la petición
export const resetPasswordRequest = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};
