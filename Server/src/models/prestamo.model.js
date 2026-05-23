const pool = require("../config/db");

class Prestamo {
  // Marca como vencidos los préstamos activos que superaron el plazo
  static async marcarVencidos(conn) {
    await conn.query(
      `UPDATE prestamo SET estado = 'vencido'
       WHERE estado = 'activo' AND fecha_devolucion < NOW()`,
    );
  }

  // CREAR PRÉSTAMO desde una reserva confirmada
  static async crearPrestamo(idReserva) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[reserva]] = await conn.query(
        `SELECT id_reserva, id_usuario, id_libro, estado
         FROM reserva WHERE id_reserva = ? FOR UPDATE`,
        [idReserva],
      );

      if (!reserva) throw new Error("Reserva no encontrada");
      if (reserva.estado !== "confirmada")
        throw new Error(
          "Solo reservas confirmadas pueden convertirse en préstamo",
        );

      // devolucion plazo límite (7 días)
      const [result] = await conn.query(
        `INSERT INTO prestamo (id_reserva, id_usuario, id_libro, fecha_devolucion)
         VALUES (?, ?, ?, NOW() + INTERVAL 7 DAY)`,
        [idReserva, reserva.id_usuario, reserva.id_libro],
      );

      await conn.query(
        `UPDATE reserva SET estado = 'prestada' WHERE id_reserva = ?`,
        [idReserva],
      );

      await conn.commit();
      return {
        message: "Préstamo creado correctamente",
        id_prestamo: result.insertId,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // LISTAR préstamos del usuario
  static async listMisPrestamos(idUsuario) {
    const conn = await pool.getConnection();
    try {
      await this.marcarVencidos(conn);

      const [rows] = await conn.query(
        `SELECT p.id_prestamo, p.estado, p.fecha_prestamo, p.fecha_devolucion,
                p.fecha_devolucion_real,
                l.title, l.author, l.cover, l.id_libro
         FROM prestamo p
         JOIN libro l ON l.id_libro = p.id_libro
         WHERE p.id_usuario = ?
         ORDER BY p.fecha_prestamo DESC`,
        [idUsuario],
      );

      return rows;
    } finally {
      conn.release();
    }
  }

  // REGISTRAR DEVOLUCIÓN (admin)
  static async devolver(idPrestamo) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[prestamo]] = await conn.query(
        `SELECT id_prestamo, id_libro, estado
         FROM prestamo WHERE id_prestamo = ? FOR UPDATE`,
        [idPrestamo],
      );

      if (!prestamo) throw new Error("Préstamo no encontrado");
      if (prestamo.estado === "devuelto")
        throw new Error("Este préstamo ya fue devuelto");

      // fecha_devolucion_real guarda cuándo se devolvió sin tocar el plazo original
      await conn.query(
        `UPDATE prestamo
         SET estado = 'devuelto', fecha_devolucion_real = NOW()
         WHERE id_prestamo = ?`,
        [idPrestamo],
      );

      await conn.query(
        `UPDATE libro SET available_quantity = available_quantity + 1
         WHERE id_libro = ?`,
        [prestamo.id_libro],
      );

      await conn.commit();
      return { message: "Devolución registrada correctamente" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // TODOS LOS PRÉSTAMOS (admin)
  static async listAllAdmin() {
    const conn = await pool.getConnection();
    try {
      await this.marcarVencidos(conn);

      const [rows] = await conn.query(
        `SELECT p.id_prestamo, p.estado, p.fecha_prestamo, p.fecha_devolucion,
                p.fecha_devolucion_real,
                u.nombre, u.apellido, u.correo,
                l.title, l.author, l.cover, l.id_libro
         FROM prestamo p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario
         INNER JOIN libro l ON l.id_libro = p.id_libro
         ORDER BY p.fecha_prestamo DESC`,
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}

module.exports = Prestamo;
