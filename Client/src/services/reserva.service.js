import api from "./api";

//Crear reserva
export const createReserva = async (idLibro) => {
  const { data } = await api.post(`/reservas/${idLibro}`);
  return data;
};

//Listar reservas
export const getReservas = async () => {
  const { data } = await api.get(`/reservas/mis`);
  return data;
};
//Cancelar reserva
export const deleteReserva = async (idReserva) => {
  const { data } = await api.delete(`/reservas/${idReserva}`);
  return data;
};
