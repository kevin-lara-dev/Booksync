const { json } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

class UserController {
  //OBTENEMOS PERFIL
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      delete user.password_hash;

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error en encontrar el perfil",
      });
    }
  }

  // userAll solo para admin
  static async getAllUsers(req, res) {
    try {
      const usuarios = await User.getAllUsers();

      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener usuarios",
      });
    }
  }

  //Actualizamos perfil
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const dataToUpdate = {};

      const {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        tipo_documento,
        numero_documento,
      } = req.body;

      if (nombre) dataToUpdate.nombre = nombre;
      if (apellido) dataToUpdate.apellido = apellido;
      if (correo) dataToUpdate.correo = correo;
      if (fecha_nacimiento) dataToUpdate.fecha_nacimiento = fecha_nacimiento;
      if (tipo_documento) dataToUpdate.tipo_documento = tipo_documento;
      if (numero_documento) dataToUpdate.numero_documento = numero_documento;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({
          message: "No se enviaron datos para actualizar",
        });
      }

      const updated = await User.update(userId, dataToUpdate);

      if (!updated) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Perfil actualizado exitosamente",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al actualizar perfil",
      });
    }
  }

  //ACTUALIZAMOS ESTADO
  static async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          message: "El estado es obligatorio",
        });
      }

      const updated = await User.updateStatus(id, estado);

      if (!updated) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Estado actualizado correctamente",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error al cambiar estado",
      });
    }
  }

  //ACTUALIZAMOS TIPO DE USUARIO (con el tiempo agregar validacion para dejar minimo un admin)
  static async changeRole(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (!tipo) {
        return res.status(400).json({
          message: "El tipo es obligatorio",
        });
      }

      if (req.user.id == id) {
        return res.status(400).json({
          message: "No puedes cambiar tu propio rol",
        });
      }

      const update = await User.updateRole(id, tipo);

      if (!update) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Rol actualizado correctamente",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error al cambiar rol",
      });
    }
  }

  //CAMBIAR CONTRASEÑA
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword: passwordActual, newPassword: passwordNueva } = req.body;

      if (!passwordActual || !passwordNueva) {
        return res.status(400).json({
          message: "Ambas contraseñas son obligatorias",
        });
      }

      if (passwordNueva.length < 6) {
        return res.status(400).json({
          message: "La nueva contraseña debe tener mínimo 6 caracteres",
        });
      }

      // Buscar usuario
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      const isMatch = await bcrypt.compare(passwordActual, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          message: "La contraseña actual es incorrecta",
        });
      }

      const newHashedPassword = await bcrypt.hash(passwordNueva, 10);

      const updated = await User.updatePassword(userId, newHashedPassword);

      if (!updated) {
        return res.status(500).json({
          message: "No se pudo actualizar la contraseña",
        });
      }

      return res.status(200).json({
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error al cambiar contraseña",
      });
    }
  }

  //BORRAMOS UNA CUENTA /DESACTIVAMOS
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.id;

      const deleted = await User.delete(userId);

      if (!deleted) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      return res.json({
        message: "Usuario eliminado exitosamente",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al borrar usuario",
      });
    }
  }
}

module.exports = UserController;
