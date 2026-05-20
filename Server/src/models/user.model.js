/*
crar usuarios               x
buscar usuarios por id      x
buscar por correo           x
Actualizar usuario          x
borrar usuarios             x

cambiar password            x
cambiar tipo                x
cambiar estado              x
*/

const pool = require("../config/db");

class User {
  //CREAR USUARIO
  static async create({
    nombre,
    apellido,
    tipo_documento,
    numero_documento,
    fecha_nacimiento,
    correo,
    password_hash,
  }) {
    const sql = `INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash, tipo, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'usuario', 'activo')`;

    const [result] = await pool.query(sql, [
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      fecha_nacimiento,
      correo,
      password_hash,
    ]);
    return result.insertId;
  }

  //lISTAR USUARIOS
  static async getAllUsers() {
    const sql = `SELECT id_usuario, nombre, apellido, correo, tipo, estado, tipo_documento, numero_documento, fecha_nacimiento FROM usuario`;
    const [rows] = await pool.query(sql);

    return rows;
  }

  //BUSCAR POR EMAIL
  static async findByEmail(correo) {
    const sql = `SELECT id_usuario, nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash, tipo, estado FROM usuario WHERE correo = ?`;

    const [rows] = await pool.query(sql, [correo]);
    return rows[0];
  }

  //BUSCAR POR ID
  static async findById(idUsuario) {
    const sql = `SELECT id_usuario, nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash, tipo, estado FROM usuario WHERE id_usuario= ?`;

    const [rows] = await pool.query(sql, [idUsuario]);
    return rows[0];
  }

  // ACTUALIZAR USUARIO
  static async update(idUsuario, data) {
    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    const sql = `
            UPDATE usuario 
            SET ${fields.join(", ")} 
            WHERE id_usuario = ?
        `;

    values.push(idUsuario);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  }

  // ACTUALIZAR USUARIO POR ESTADO (activar/desactivar)
  static async updateStatus(idUsuario, estado) {
    const sql = `UPDATE usuario SET estado = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [estado, idUsuario]);

    return result.affectedRows > 0;
  }

  // cambiar tipo de usuario
  static async updateRole(idUsuario, tipo) {
    const sql = `UPDATE usuario SET tipo = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [tipo, idUsuario]);

    return result.affectedRows > 0;
  }

  // CAMBIAR CONTRASEÑA
  static async updatePassword(idUsuario, password_hash) {
    const sql = `UPDATE usuario SET password_hash = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [password_hash, idUsuario]);

    return result.affectedRows > 0;
  }

  //BORRAR / DESACTIVAR USUARIO
  static async delete(idUsuario) {
    const sql = `UPDATE usuario SET estado = 'inactivo' WHERE id_usuario = ?`;

    const [result] = await pool.query(sql, [idUsuario]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
