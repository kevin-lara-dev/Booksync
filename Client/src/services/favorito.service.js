import api from "./api";

// Verifica si un libro ya está en favoritos del usuario logueado. Devuelve { isFav: boolean }.
export const isFavorite = async (idLibro) => {
  const { data } = await api.get(`/favorite/${idLibro}`);
  return data;
};

// Agrega un libro a favoritos del usuario logueado
export const addFavorite = async (idLibro) => {
  const { data } = await api.post(`/favorite/${idLibro}`);
  return data;
};

// Elimina un libro de favoritos del usuario logueado
export const deleteFavorite = async (idLibro) => {
  const { data } = await api.delete(`/favorite/${idLibro}`);
  return data;
};

// Trae todos los favoritos del usuario logueado, incluyendo los datos completos de cada libro
export const getFavorites = async () => {
  const { data } = await api.get(`/favorite`);
  return data;
};
