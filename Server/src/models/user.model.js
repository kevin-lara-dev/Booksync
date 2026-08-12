/*
  Modelo de usuario.
  Contiene todas las operaciones sobre la tabla "usuario":
  crear, buscar por ID o correo, actualizar perfil, cambiar contraseña,
  cambiar rol, cambiar estado y desactivar (soft delete).
*/

const pool = require("../config/db");

class User {
  // Inserta un nuevo usuario con rol "usuario" y estado "activo" por defecto
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

  // Obtiene todos los usuarios del sistema sin incluir el hash de la contraseña
  static async getAllUsers() {
    const sql = `SELECT id_usuario, nombre, apellido, correo, tipo, estado, tipo_documento, numero_documento, fecha_nacimiento FROM usuario`;
    const [rows] = await pool.query(sql);

    return rows;
  }

  // Busca un usuario por su correo. Se usa en el login y en el registro para validar duplicados.
  static async findByEmail(correo) {
    const sql = `SELECT id_usuario, nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash, tipo, estado FROM usuario WHERE correo = ?`;

    const [rows] = await pool.query(sql, [correo]);
    return rows[0];
  }

  // Busca un usuario por su ID. Se usa al obtener el perfil y al cambiar la contraseña.
  static async findById(idUsuario) {
    const sql = `SELECT id_usuario, nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash, tipo, estado FROM usuario WHERE id_usuario= ?`;

    const [rows] = await pool.query(sql, [idUsuario]);
    return rows[0];
  }

  // Actualiza los campos del perfil que se reciban como parámetro, sin tocar los demás
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

  // Cambia el estado del usuario entre "activo" e "inactivo"
  static async updateStatus(idUsuario, estado) {
    const sql = `UPDATE usuario SET estado = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [estado, idUsuario]);

    return result.affectedRows > 0;
  }

  // Cuenta cuántos administradores ACTIVOS hay en el sistema (no cuenta los inactivos).
  // Se usa antes de cambiar el rol o el estado de alguien, para evitar quedar sin ningún administrador activo.
  static async countAdmins() {
    const sql = `SELECT COUNT(*) AS total FROM usuario WHERE tipo = 'administrador' AND estado = 'activo'`;
    const [rows] = await pool.query(sql);
    return rows[0].total;
  }

  // Cambia el rol del usuario entre "usuario" y "administrador"
  static async updateRole(idUsuario, tipo) {
    const sql = `UPDATE usuario SET tipo = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [tipo, idUsuario]);

    return result.affectedRows > 0;
  }

  // Actualiza el hash de la contraseña en la base de datos
  static async updatePassword(idUsuario, password_hash) {
    const sql = `UPDATE usuario SET password_hash = ? WHERE id_usuario = ?`;
    const [result] = await pool.query(sql, [password_hash, idUsuario]);

    return result.affectedRows > 0;
  }

  // Soft delete: desactiva el usuario marcándolo como "inactivo" sin eliminarlo físicamente
  static async delete(idUsuario) {
    const sql = `UPDATE usuario SET estado = 'inactivo' WHERE id_usuario = ?`;

    const [result] = await pool.query(sql, [idUsuario]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
