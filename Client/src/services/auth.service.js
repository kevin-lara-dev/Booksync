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
