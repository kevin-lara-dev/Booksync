import api from "./api";

//Listar reservas
export const getReservas = async () => {
  const { data } = await api.get(`/reservas/mis`);
  return data;
};

//Crear reserva
export const createReserva = async (idLibro) => {
  const { data } = await api.post(`/reservas/${idLibro}`);
  return data;
};

//Cancelar reserva
export const deleteReserva = async (idReserva) => {
  const { data } = await api.delete(`/reservas/${idReserva}`);
  return data;
};

// ============================
// ADMIN RESERVAS
// ============================

//Listar reservas admin
export const getReservasAdmin = async () => {
  const { data } = await api.get("/reservas/admin");
  return data;
};

//Confirmar reserva admin
export const confirmReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/confirmar`);
  return data;
};

//Cancelar reserva admin
export const cancelReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/cancelar`);
  return data;
};
