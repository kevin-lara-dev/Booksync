const Prestamo = require("../models/prestamo.model");

class PrestamoController {
  // CREAR PRÉSTAMO desde reserva confirmada (admin)
  static async create(req, res) {
    try {
      const idReserva = Number(req.params.idReserva);
      if (!Number.isInteger(idReserva) || idReserva <= 0) {
        return res.status(400).json({ message: "idReserva inválido" });
      }
      const result = await Prestamo.crearPrestamo(idReserva);
      return res.status(201).json(result);
    } catch (error) {
      const msg = error.message || "Error creando préstamo";

      if (msg.includes("Reserva no encontrada"))
        return res.status(404).json({ message: msg });

      if (msg.includes("confirmadas"))
        return res.status(409).json({ message: msg });

      return res
        .status(500)
        .json({ message: "Error creando préstamo", error: msg });
    }
  }

  // LISTAR préstamos del usuario autenticado
  static async myList(req, res) {
    try {
      const idUsuario = req.user.id;
      const rows = await Prestamo.listMisPrestamos(idUsuario);
      return res.json({ prestamos: rows });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error listando préstamos", error: error.message });
    }
  }

  // REGISTRAR DEVOLUCIÓN (admin)
  static async devolver(req, res) {
    try {
      const idPrestamo = Number(req.params.idPrestamo);
      if (!Number.isInteger(idPrestamo) || idPrestamo <= 0) {
        return res.status(400).json({ message: "idPrestamo inválido" });
      }
      const result = await Prestamo.devolver(idPrestamo);
      return res.json(result);
    } catch (error) {
      const msg = error.message || "Error registrando devolución";

      if (msg.includes("no encontrado"))
        return res.status(404).json({ message: msg });

      if (msg.includes("ya fue devuelto"))
        return res.status(409).json({ message: msg });

      return res
        .status(500)
        .json({ message: "Error registrando devolución", error: msg });
    }
  }

  // LISTAR todos los préstamos (admin)
  static async adminList(req, res) {
    try {
      const rows = await Prestamo.listAllAdmin();
      return res.json({ prestamos: rows });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error listando préstamos", error: error.message });
    }
  }
}

module.exports = PrestamoController;
