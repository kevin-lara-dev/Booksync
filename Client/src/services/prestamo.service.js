import api from "./api";

// mi historial de préstamos
export const getMisPrestamos = async () => {
  const { data } = await api.get("/prestamos/MisPrestamos");
  return data;
};

// todos los préstamos del sistema — solo para admin
export const getPrestamosAdmin = async () => {
  const { data } = await api.get("/prestamos/list");
  return data;
};

// convierte una reserva en préstamo activo — cuando el admin le entrega el libro al usuario
export const crearPrestamo = async (idReserva) => {
  const { data } = await api.post(`/prestamos/reserva/${idReserva}`);
  return data;
};

// registrar devolución — libera stock y cierra el préstamo
export const devolverPrestamo = async (idPrestamo) => {
  const { data } = await api.patch(`/prestamos/devolver/${idPrestamo}`);
  return data;
};
