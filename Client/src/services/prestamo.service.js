import api from "./api";

// Trae el historial de préstamos del usuario logueado (activos, vencidos y devueltos)
export const getMisPrestamos = async () => {
  const { data } = await api.get("/prestamos/MisPrestamos");
  return data;
};

// Trae todos los préstamos del sistema. Solo disponible para administradores.
export const getPrestamosAdmin = async () => {
  const { data } = await api.get("/prestamos/list");
  return data;
};

// Convierte una reserva confirmada en préstamo activo. Se llama cuando el administrador entrega el libro físicamente al usuario.
export const crearPrestamo = async (idReserva) => {
  const { data } = await api.post(`/prestamos/reserva/${idReserva}`);
  return data;
};

// Registra la devolución de un libro. Libera el ejemplar en el stock y cierra el préstamo.
export const devolverPrestamo = async (idPrestamo) => {
  const { data } = await api.patch(`/prestamos/devolver/${idPrestamo}`);
  return data;
};
