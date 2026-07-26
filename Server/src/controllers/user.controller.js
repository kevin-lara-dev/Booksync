const { json } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

class UserController {

  // Obtiene el perfil del usuario autenticado
  static async getProfile(req, res) {
    try {
      // req.user.id lo agrega el middleware verifyToken después de validar el JWT
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Se elimina el hash de la respuesta antes de enviarla; nunca debe exponerse al cliente
      delete user.password_hash;

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error en encontrar el perfil" });
    }
  }


  // Lista todos los usuarios del sistema. Solo accesible para administradores;
  // el middleware isAdmin se encarga de validarlo en la ruta.
  static async getAllUsers(req, res) {
    try {
      const usuarios = await User.getAllUsers();
      return res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }


  // Actualiza los datos del perfil del usuario autenticado
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      // Se construye el objeto solo con los campos que llegaron, para no sobrescribir los que no se enviaron
      const dataToUpdate = {};
      const { nombre, apellido, correo, fecha_nacimiento, tipo_documento, numero_documento } = req.body;

      if (nombre) dataToUpdate.nombre = nombre;
      if (apellido) dataToUpdate.apellido = apellido;
      if (correo) dataToUpdate.correo = correo;
      if (fecha_nacimiento) dataToUpdate.fecha_nacimiento = fecha_nacimiento;
      if (tipo_documento) dataToUpdate.tipo_documento = tipo_documento;
      if (numero_documento) dataToUpdate.numero_documento = numero_documento;

      // Si el cuerpo llegó vacío, no tiene sentido ejecutar la consulta
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: "No se enviaron datos para actualizar" });
      }

      const updated = await User.update(userId, dataToUpdate);

      if (!updated) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ message: "Perfil actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar perfil" });
    }
  }


  // Activa o desactiva un usuario. Solo puede ejecutarlo un administrador.
  static async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body; // "activo" o "inactivo"

      if (!estado) {
        return res.status(400).json({ message: "El estado es obligatorio" });
      }

      const updated = await User.updateStatus(id, estado);

      if (!updated) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ message: "Estado actualizado correctamente" });
    } catch (error) {
      return res.status(500).json({ message: "Error al cambiar estado" });
    }
  }


  // Cambia el rol de un usuario. Solo puede ejecutarlo un administrador.
  static async changeRole(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (!tipo) {
        return res.status(400).json({ message: "El tipo es obligatorio" });
      }

      // No se permite que un administrador cambie su propio rol,
      // para evitar que el sistema quede sin ningún administrador
      if (req.user.id == id) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }

      // Si se va a retirar el rol de administrador a alguien,
      // se verifica que haya al menos otro administrador activo en el sistema
      if (tipo !== "administrador") {
        const targetUser = await User.findById(id);
        if (targetUser?.tipo === "administrador") {
          const totalAdmins = await User.countAdmins();
          if (totalAdmins <= 1) {
            return res.status(400).json({ message: "Debe haber al menos un administrador en el sistema" });
          }
        }
      }

      const update = await User.updateRole(id, tipo);

      if (!update) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ message: "Rol actualizado correctamente" });
    } catch (error) {
      return res.status(500).json({ message: "Error al cambiar rol" });
    }
  }


  // Permite al usuario cambiar su propia contraseña
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { passwordActual, passwordNueva } = req.body;

      if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ message: "Ambas contraseñas son obligatorias" });
      }

      if (passwordNueva.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener mínimo 6 caracteres" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Se verifica que el usuario conozca su contraseña actual antes de permitir el cambio
      const isMatch = await bcrypt.compare(passwordActual, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }

      const newHashedPassword = await bcrypt.hash(passwordNueva, 10);

      const updated = await User.updatePassword(userId, newHashedPassword);

      if (!updated) {
        return res.status(500).json({ message: "No se pudo actualizar la contraseña" });
      }

      return res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      return res.status(500).json({ message: "Error al cambiar contraseña" });
    }
  }


  // Soft delete: no se elimina el registro físicamente, solo se marca el usuario como inactivo
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.id;

      const deleted = await User.delete(userId);

      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al borrar usuario" });
    }
  }
}

module.exports = UserController;
