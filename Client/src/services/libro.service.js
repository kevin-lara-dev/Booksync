import api from "./api";

// Lista libros con filtros opcionales — params es un objeto { title, genre, sort, order }.
// Si no se pasan parámetros, trae todos los libros (lo usa InventarioAdmin para mostrar el inventario completo).
export const getLibrosRequest = async (params = {}) => {
  const response = await api.get("/libros", { params });
  return response.data;
};

// Obtiene el detalle completo de un libro por su id. Lo usa Detalle.jsx.
export const getLibroById = async (id) => {
  const response = await api.get(`/libros/${id}`);
  return response.data;
};

// Devuelve los géneros únicos disponibles en el catálogo. Lo usa Home.jsx para el filtro de búsqueda.
export const getGenres = async () => {
  const response = await api.get("/libros/genres");
  return response.data;
};

// Devuelve los libros más recomendados (más prestados históricamente). Lo usa Home.jsx para el carrusel.
export const getRecommendedBooks = async (limit = 8) => {
  const response = await api.get("/libros/recomendados", { params: { limit } });
  return response.data;
};

// Sube la portada de un libro a Cloudflare R2 y devuelve { url } con la URL pública resultante
export const uploadCover = async (file) => {
  const formData = new FormData();
  formData.append("cover", file);

  const response = await api.post("/libros/upload-cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Crea un libro nuevo en el inventario
export const createLibro = async (data) => {
  const response = await api.post("/libros", data);
  return response.data;
};

// Actualiza un libro existente. Acepta cambios parciales: solo se sobreescriben los campos que se envíen.
export const updateLibro = (id, data) => {
  return api.put(`/libros/${id}`, data);
};

// Elimina un libro del catálogo visible. Es un soft delete: el registro queda en la base de datos marcado como inactivo.
export const deleteLibro = (id) => {
  return api.delete(`/libros/${id}`);
};

// Importa libros en lote. Recibe un array de objetos ya parseados desde el CSV en el frontend.
export const importLibros = async (books) => {
  const response = await api.post("/libros/import", { books });
  return response.data;
};
