const Reserva = require("../models/reserva.model");

class ReservaController {
  //Crear reservas
  static async create(req, res) {
    try {
      const idUsuario = req.user.id;
      const idLibro = Number(req.params.idLibro);

      if (!Number.isInteger(idLibro) || idLibro <= 0) {
        return res.status(400).json({ message: "idLibro invalido" });
      }

      const result = await Reserva.createReserva(idUsuario, idLibro);
      return res.status(201).json(result);
    } catch (error) {
      const msg = error.message || "Error creando reserva";

      if (msg.includes("Límite")) {
        return res.status(409).json({ message: msg });
      }

      if (msg.includes("No hay ejemplares")) {
        return res.status(409).json({ message: msg });
      }

      if (msg.includes("Libro no existe")) {
        return res.status(404).json({ message: msg });
      }

      if (msg.includes("Ya tienes una reserva")) {
        return res.status(409).json({ message: msg });
      }

      if (msg.includes("no está disponible")) {
        return res.status(409).json({ message: msg });
      }

      return res
        .status(500)
        .json({ message: "Error creando reserva", error: msg });
    }
  }

  //LISTAR RESERVAS
  static async myList(req, res) {
    try {
      const idUsuario = req.user.id;
      const rows = await Reserva.listMisReservas(idUsuario);

      return res.json({ reservas: rows });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error listando reservas", error: error.message });
    }
  }

  //BORRAR RESERVAS
  static async cancel(req, res) {
    try {
      const idUsuario = req.user.id;
      const idReserva = Number(req.params.idReserva);

      if (!Number.isInteger(idReserva) || idReserva <= 0) {
        return res.status(400).json({ message: "idReserva invalido" });
      }

      const result = await Reserva.cancelReserva(idUsuario, idReserva);
      return res.json(result);
    } catch (error) {
      const msg = error.message || "Error cancelando reserva";

      if (msg.includes("Reserva no encontrada"))
        return res.status(404).json({ message: msg });

      if (msg.includes("Solo reservas activas"))
        return res.status(409).json({ message: msg });

      return res
        .status(500)
        .json({ message: "Error cancelando reserva", error: msg });
    }
  }
}

module.exports = ReservaController;
