import axios from "axios";

// instancia de axios con el baseURL ya configurado, la uso en todos los servicios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// antes de cada petición le meto el token si existe, pa no hacerlo manual en cada llamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// si el servidor responde 401 y no es una ruta de auth, limpio la sesión y mando al login
// así si el token expira la app cierra sola sin quedarse rota
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
