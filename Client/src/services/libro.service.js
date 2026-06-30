import api from "./api";

// listar libros con filtros opcionales — params es un objeto { title, genre, sort, order }
// si no se pasan params trae todos (lo usa InventarioAdmin)
export const getLibrosRequest = async (params = {}) => {
  const response = await api.get("/libros", { params });
  return response.data;
};

// detalle de un libro por id — lo usa Detalle.jsx
export const getLibroById = async (id) => {
  const response = await api.get(`/libros/${id}`);
  return response.data;
};

// géneros únicos — lo usa Home.jsx pa el filtro de búsqueda
export const getGenres = async () => {
  const response = await api.get("/libros/genres");
  return response.data;
};

//CREAR LIBROS
export const createLibro = async (data) => {
  const response = await api.post("/libros", data);
  return response.data;
};

//ACTUALIZAR LIBROS — acepta cambios parciales
export const updateLibro = (id, data) => {
  return api.put(`/libros/${id}`, data);
};

//BORRAR LIBROS — soft delete, no desaparece de la bd
export const deleteLibro = (id) => {
  return api.delete(`/libros/${id}`);
};

// IMPORTAR LIBROS EN LOTE — recibe array de objetos parseados del CSV
export const importLibros = async (books) => {
  const response = await api.post("/libros/import", { books });
  return response.data;
};
