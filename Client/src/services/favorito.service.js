import api from "./api";

// pregunto si un libro ya está en mis favoritos — devuelve { isFav: boolean }
export const isFavorite = async (idLibro) => {
  const { data } = await api.get(`/favorite/${idLibro}`);
  return data;
};

// agregar a favoritos
export const addFavorite = async (idLibro) => {
  const { data } = await api.post(`/favorite/${idLibro}`);
  return data;
};

// quitar de favoritos
export const deleteFavorite = async (idLibro) => {
  const { data } = await api.delete(`/favorite/${idLibro}`);
  return data;
};

// traer todos mis favoritos con los datos del libro
export const getFavorites = async () => {
  const { data } = await api.get(`/favorite`);
  return data;
};
