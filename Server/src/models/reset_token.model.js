const pool = require("../config/db");

class ResetToken {
  // Almacena el token de recuperación en la base de datos, asociado al usuario que hizo la solicitud.
  // El id_usuario no se genera aquí; lo decide el controller que verificó a quién pertenece el correo.
  static async createToken(id_usuario, token, expires_at) {
    const sql = `INSERT INTO reset_token (id_usuario, token, expires_at) VALUES (?, ?, ?)`;
    const [result] = await pool.query(sql, [id_usuario, token, expires_at]);
    return result.insertId;
  }

  // Busca el token y verifica en la misma consulta que no haya expirado.
  // Si devuelve null, el token no existe o ya venció. Para el controller el resultado es el mismo: se rechaza el enlace.
  static async findByToken(token) {
    const sql = `SELECT * FROM reset_token WHERE token = ? AND expires_at > NOW()`;
    const [rows] = await pool.query(sql, [token]);
    return rows[0] || null;
  }

  // Elimina el token una vez que el usuario cambió su contraseña.
  // Sin este paso, el mismo enlace del correo podría reutilizarse.
  static async deleteByToken(token) {
    const sql = `DELETE FROM reset_token WHERE token = ?`;
    const [result] = await pool.query(sql, [token]);
    return result.affectedRows > 0;
  }
}

module.exports = ResetToken;
