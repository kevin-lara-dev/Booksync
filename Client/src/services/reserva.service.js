import api from "./api";

// Trae las reservas activas e históricas del usuario logueado
export const getReservas = async () => {
  const { data } = await api.get(`/reservas/mis`);
  return data;
};

// Crea una reserva para el libro indicado. El servidor verifica disponibilidad y límite de reservas activas antes de crearla.
export const createReserva = async (idLibro) => {
  const { data } = await api.post(`/reservas/${idLibro}`);
  return data;
};

// Cancela una reserva del usuario logueado y devuelve el ejemplar al stock
export const deleteReserva = async (idReserva) => {
  const { data } = await api.delete(`/reservas/${idReserva}`);
  return data;
};

// ============================
// ADMIN RESERVAS
// ============================

// Trae todas las reservas del sistema (solo disponible para administradores)
export const getReservasAdmin = async () => {
  const { data } = await api.get("/reservas/admin");
  return data;
};

// Confirma una reserva para que el usuario pueda pasar a retirar el libro físicamente
export const confirmReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/confirmar`);
  return data;
};

// Cancela una reserva desde el panel de administración y devuelve el ejemplar al stock
export const cancelReservaAdmin = async (idReserva) => {
  const { data } = await api.patch(`/reservas/admin/${idReserva}/cancelar`);
  return data;
};

// Crea una reserva a nombre de cualquier usuario desde el panel de administración
export const crearReservaAdmin = async (idUsuario, idLibro) => {
  const { data } = await api.post("/reservas/admin", { id_usuario: idUsuario, id_libro: idLibro });
  return data;
};
