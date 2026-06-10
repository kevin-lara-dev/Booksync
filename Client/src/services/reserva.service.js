import api from "./api";

// mis reservas
export const getReservas = async () => {
  const { data } = await api.get(`/reservas/mis`);
  return data;
};

// crear reserva — el back verifica disponibilidad antes de crearla
export const createReserva = async (idLibro) => {
  const { data } = await api.post(`/reservas/${idLibro}`);
  return data;
};

// cancelar una de mis reservas
export const deleteReserva = async (idReserva) => {
  const { data } = await api.delete(`/reservas/${idReserva}`);
  return data;
};

// ============================
// ADMIN RESERVAS
// ============================

// todas las reservas del sistema
export const getReservasAdmin = async () => {
  const { data } = await api.get("/reservas/admin");
  return data;
};

// aprobar una reserva pa que el usuario pueda retirar el libro
export const confirmReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/confirmar`);
  return data;
};

// cancelar una reserva desde el panel admin
export const cancelReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/cancelar`);
  return data;
};
