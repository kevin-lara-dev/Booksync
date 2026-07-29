const pool = require("../config/db");

class Reserva {
  // Marca como expiradas las reservas que superaron su fecha límite y devuelve los libros al stock
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

  // Crea una reserva dentro de una transacción. Valida límites, stock y duplicados antes de confirmar.
  static async createReserva(idUsuario, idLibro) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Expira las reservas vencidas antes de validar para trabajar con datos actualizados
      await this.expireReservas(conn);

      const [[usuario]] = await conn.query(
        `SELECT estado FROM usuario WHERE id_usuario = ?`,
        [idUsuario],
      );

      if (!usuario) {
        throw new Error("Usuario no existe");
      }

      if (usuario.estado !== "activo") {
        throw new Error("El usuario no está activo y no puede reservar");
      }

      // Verifica que el usuario no supere el límite de 3 reservas activas simultáneas
      const [[{ total }]] = await conn.query(
        `SELECT COUNT(*) as total FROM reserva WHERE id_usuario = ? AND estado = 'activa'`,
        [idUsuario],
      );
      if (total >= 3) {
        throw new Error("Limite de 3 reservas activas alcanzado");
      }

      // Validar que no tenga ya una reserva activa o confirmada del mismo libro
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

      // Descuenta una unidad del stock disponible del libro
      await conn.query(
        `UPDATE libro SET available_quantity =  available_quantity - 1 WHERE id_libro = ?`,
        [idLibro],
      );

      // Inserta la reserva con una vigencia de 32 horas a partir de este momento
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

  // Devuelve todas las reservas del usuario, ordenadas de más reciente a más antigua
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

  // Cancela una reserva activa del usuario y devuelve el ejemplar al stock del libro
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

      // Marca la reserva como cancelada y registra la fecha de cancelación
      await conn.query(
        `
        UPDATE reserva
        SET estado = 'cancelada', cancelled_at = NOW()
        WHERE id_reserva = ?
        `,
        [idReserva],
      );

      // Devuelve el ejemplar al stock del libro
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

  // =========================
  // ADMIN
  // =========================

  // Listar todas las reservas para admin
  static async listAllReservasAdmin() {
    const conn = await pool.getConnection();
    try {
      await this.expireReservas(conn);

      const [rows] = await conn.query(
        `
        SELECT 
          r.id_reserva,
          r.estado,
          r.fecha_reserva,
          r.expires_at,
          r.cancelled_at,
          r.confirmed_at,
          r.id_usuario,
          u.nombre,
          u.apellido,
          u.correo,
          r.id_libro,
          l.title,
          l.author,
          l.isbn,
          l.cover,
          l.genre
        FROM reserva r
        INNER JOIN usuario u ON u.id_usuario = r.id_usuario
        INNER JOIN libro l ON l.id_libro = r.id_libro
        ORDER BY r.fecha_reserva DESC
        `,
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  // Confirma una reserva activa. Solo puede hacerlo un administrador.
  static async confirmReservaAdmin(idReserva) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await this.expireReservas(conn);

      const [[reserva]] = await conn.query(
        `
        SELECT id_reserva, estado
        FROM reserva
        WHERE id_reserva = ?
        FOR UPDATE
        `,
        [idReserva],
      );

      if (!reserva) {
        throw new Error("Reserva no encontrada");
      }

      if (reserva.estado !== "activa") {
        throw new Error("Solo reservas activas pueden ser confirmadas");
      }

      await conn.query(
        `
        UPDATE reserva
        SET estado = 'confirmada', confirmed_at = NOW()
        WHERE id_reserva = ?
        `,
        [idReserva],
      );

      await conn.commit();

      return { message: "Reserva confirmada correctamente" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Cancela una reserva activa desde el panel de administración y devuelve el libro al stock
  static async cancelReservaAdmin(idReserva) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await this.expireReservas(conn);

      const [[reserva]] = await conn.query(
        `
        SELECT id_reserva, id_libro, estado
        FROM reserva
        WHERE id_reserva = ?
        FOR UPDATE
        `,
        [idReserva],
      );

      if (!reserva) {
        throw new Error("Reserva no encontrada");
      }

      if (reserva.estado !== "activa") {
        throw new Error("Solo reservas activas pueden cancelarse");
      }

      await conn.query(
        `
        UPDATE reserva
        SET estado = 'cancelada',
            cancelled_at = NOW()
        WHERE id_reserva = ?
        `,
        [idReserva],
      );

      await conn.query(
        `
        UPDATE libro
        SET available_quantity = available_quantity + 1
        WHERE id_libro = ?
        `,
        [reserva.id_libro],
      );

      await conn.commit();

      return { message: "Reserva cancelada por el administrador" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = Reserva;
