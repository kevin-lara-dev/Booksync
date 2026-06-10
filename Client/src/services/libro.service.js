import api from "./api";

//LISTAR LIBROS — devuelve { total, libros }
export const getLibrosRequest = async () => {
  const response = await api.get("/libros");
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
