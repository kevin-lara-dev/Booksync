import axios from "axios";

// Instancia de Axios compartida por todos los servicios. Tiene el baseURL y los interceptores de autenticación configurados.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor de solicitud: adjunta el token de autenticación a cada petición automáticamente, evitando hacerlo manualmente en cada llamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si el servidor responde 401 y no es una ruta de autenticación,
// limpia la sesión y redirige al login. Así, si el token expira, la app cierra sola sin quedarse en un estado roto.
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
