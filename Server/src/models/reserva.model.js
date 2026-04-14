const pool = require("../config/db");

class Reserva {
  //expirar reservas vencidas
  static async expireReservas(conn) {
    const [expired] = await conn.query(
      `SELECT id_reserva, id_libro FROM reserva WHERE estado = 'activa' AND expires_at < NOW()`,
    );

    if (expired.length === 0) return;

    await conn.query(
      `UPDATE reserva SET estado = 'expirada' WHERE estado = 'activa' AND expires_at < NOW()`,
    );

    for (const r of expired) {
      await conn.query(
        `UPDATE libro SET available_quantity = available_quantity + 1 WHERE id_libro = ?`,
        [r.id_libro],
      );
    }
  }

  //crear reserva
  static async createReserva(idUsuario, idLibro) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      //expirar reservas
      await this.expireReservas(conn);

      //verificamos limite
      const [[{ total }]] = await conn.query(
        `SELECT COUNT(*) as total FROM reserva WHERE id_usuario = ? AND estado = 'activa'`,
        [idUsuario],
      );
      if (total >= 3) {
        throw new Error("Limite de 3 reservas activas alcanzado");
      }

      // 3) Validar que no tenga ya una reserva activa o confirmada del mismo libro
      const [[duplicada]] = await conn.query(
        `SELECT id_usuario, estado FROM reserva WHERE id_usuario = ? AND id_libro  = ? AND estado IN ('activa', 'confirmada', 'prestada') LIMIT 1`,
        [idUsuario, idLibro],
      );

      if (duplicada) {
        throw new Error(
          "Ya tienes una reserva o préstamo activo para este libro",
        );
      }

      //verificamos stock y existencia del libro
      const [[libro]] = await conn.query(
        `SELECT id_libro, available_quantity, status FROM libro WHERE id_libro = ? FOR UPDATE`,
        [idLibro],
      );
      if (!libro) {
        throw new Error("Libro no existe");
      }

      if (libro.status !== "disponible") {
        throw new Error("El libro no está disponible para reserva");
      }

      if (libro.available_quantity <= 0) {
        throw new Error("No hay ejemplares disponibles");
      }

      //Descontar stock
      await conn.query(
        `UPDATE libro SET available_quantity =  available_quantity - 1 WHERE id_libro = ?`,
        [idLibro],
      );

      //insertar reserva
      const [result] = await conn.query(
        `INSERT INTO reserva (id_usuario, id_libro, expires_at) VALUES (?, ?, NOW() + INTERVAL 32 HOUR)`,
        [idUsuario, idLibro],
      );

      await conn.commit();

      return {
        message: "Reserva creada exitosamente",
        id_reserva: result.insertId,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  //LISTAR RESERVAS
  static async listMisReservas(idUsuario) {
    const conn = await pool.getConnection();

    try {
      await this.expireReservas(conn);

      const [rows] = await conn.query(
        `
            SELECT r.id_reserva, r.estado, r.fecha_reserva, r.expires_at, r.cancelled_at, r.confirmed_at, r.id_libro, l.title, l.author, l.cover
            FROM reserva r
            INNER JOIN libro l ON l.id_libro = r.id_libro
            WHERE r.id_usuario = ?
            ORDER BY r.fecha_reserva DESC
        `,
        [idUsuario],
      );

      return rows;
    } finally {
      conn.release();
    }
  }

  //CANCELAR RESERVA
  static async cancelReserva(idUsuario, idReserva) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [[reserva]] = await conn.query(
        `
                SELECT id_libro, estado 
                FROM reserva
                WHERE id_reserva = ?
                AND id_usuario = ?
                FOR UPDATE
                `,
        [idReserva, idUsuario],
      );

      if (!reserva) {
        throw new Error("Reserva no encontrada");
      }
      if (reserva.estado !== "activa") {
        throw new Error("Solo reservas activas pueden cancelarse");
      }

      //CAMBIAR ESTADO
      await conn.query(
        `
        UPDATE reserva
        SET estado = 'cancelada', cancelled_at = NOW()
        WHERE id_reserva = ?
        `,
        [idReserva],
      );

      //DEVOLVER STOCK
      await conn.query(
        `
        UPDATE libro 
        SET available_quantity = available_quantity + 1
        WHERE id_libro = ?
        `,
        [reserva.id_libro],
      );

      await conn.commit();
      return { message: "Reserva cancelada correctamente" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = Reserva;
