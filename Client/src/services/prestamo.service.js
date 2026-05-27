import api from "./api";

export const getMisPrestamos = async () => {
  const { data } = await api.get("/prestamos/MisPrestamos");
  return data;
};

export const getPrestamosAdmin = async () => {
  const { data } = await api.get("/prestamos/list");
  return data;
};

export const crearPrestamo = async (idReserva) => {
  const { data } = await api.post(`/prestamos/reserva/${idReserva}`);
  return data;
};

export const devolverPrestamo = async (idPrestamo) => {
  const { data } = await api.post(`/prestamos/devolver/${idPrestamo}`);
  return data;
};
