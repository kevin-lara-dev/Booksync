const { json } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

class UserController {

  //OBTENEMOS PERFIL
  static async getProfile(req, res) {
    try {
      // req.user.id me lo deja el middleware verifyToken después de leer el token
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // borro el hash antes de mandar el objeto, no quiero exponer eso al cliente
      delete user.password_hash;

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error en encontrar el perfil" });
    }
  }


  // userAll — solo para admin, isAdmin lo valida en la ruta
  static async getAllUsers(req, res) {
    try {
      const usuarios = await User.getAllUsers();
      return res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }


  //Actualizamos perfil
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      // armo el objeto solo con los campos que llegaron, no piso lo que no se envió
      const dataToUpdate = {};
      const { nombre, apellido, correo, fecha_nacimiento, tipo_documento, numero_documento } = req.body;

      if (nombre) dataToUpdate.nombre = nombre;
      if (apellido) dataToUpdate.apellido = apellido;
      if (correo) dataToUpdate.correo = correo;
      if (fecha_nacimiento) dataToUpdate.fecha_nacimiento = fecha_nacimiento;
      if (tipo_documento) dataToUpdate.tipo_documento = tipo_documento;
      if (numero_documento) dataToUpdate.numero_documento = numero_documento;

      // si el body llegó vacío no tiene sentido ir a la bd
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


  //ACTUALIZAMOS ESTADO
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


  //ACTUALIZAMOS TIPO DE USUARIO
  static async changeRole(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (!tipo) {
        return res.status(400).json({ message: "El tipo es obligatorio" });
      }

      // no dejo que el admin se cambie el rol a sí mismo, pa que no quede bloqueado
      if (req.user.id == id) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }

      // si van a quitarle el rol de admin a alguien, verifico que no sea el único que queda
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


  //CAMBIAR CONTRASEÑA
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

      // confirmo que sí sepa su contraseña actual antes de dejarla cambiar
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


  //BORRAMOS UNA CUENTA — en realidad es soft delete, solo lo pone inactivo en la bd
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
