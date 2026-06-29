const pool = require("../config/db");

class ResetToken {
  // guardo el token en la bd ligado al usuario que pidió el reset
  // el id_usuario no se genera aquí — llega del controller
  static async createToken(id_usuario, token, expires_at) {
    const sql = `INSERT INTO reset_token (id_usuario, token, expires_at) VALUES (?, ?, ?)`;
    const [result] = await pool.query(sql, [id_usuario, token, expires_at]);
    return result.insertId;
  }

  // busco el token y verifico que no haya expirado en la misma query
  // si devuelve null puede ser que no exista o que venció — pa el controller es lo mismo: rechazo
  static async findByToken(token) {
    const sql = `SELECT * FROM reset_token WHERE token = ? AND expires_at > NOW()`;
    const [rows] = await pool.query(sql, [token]);
    return rows[0] || null;
  }

  // borro el token una vez que el usuario ya cambió su contraseña
  // sin esto el mismo link del correo podría usarse más de una vez
  static async deleteByToken(token) {
    const sql = `DELETE FROM reset_token WHERE token = ?`;
    const [result] = await pool.query(sql, [token]);
    return result.affectedRows > 0;
  }
}

module.exports = ResetToken;
