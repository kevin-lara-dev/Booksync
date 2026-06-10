// TODO: en el futuro implementar refresh token y blacklist para el logout real

const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// saco el secret y la expiración del .env pa no tenerlos hardcodeados aqui
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

class AuthController {

  //regitro
  static async register(req, res) {
    try {
      // saco todo lo que necesito del body
      const { nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password } = req.body;

      // si falta algo rechazo antes de ir a la bd
      if (!nombre || !apellido || !tipo_documento || !numero_documento || !fecha_nacimiento || !correo || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // no dejo registrar el mismo correo dos veces
      const existingUser = await User.findByEmail(correo);
      if (existingUser) {
        return res.status(409).json({ message: "El correo ya esta registrado" });
      }

      // nunca guardo la contraseña en texto plano, siempre hasheada con salt 10
      const password_hash = await bcrypt.hash(password, 10);

      const userId = await User.create({ nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash });

      return res.status(201).json({ message: "Usuario creado exitosamente", userId });

    } catch (error) {
      res.status(500).json({ message: "Error al crear un usuario" });
    }
  }


  //LOGIN
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // busco el usuario — si no existe respondo lo mismo que si la contraseña es incorrecta
      // asi no le doy pistas a nadie de si un correo existe o no
      const user = await User.findByEmail(correo);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // aunque las credenciales sean correctas, un usuario inactivo no puede entrar
      if (user.estado !== "activo") {
        return res.status(403).json({ message: "Usuario inactivo" });
      }

      // comparo lo que llegó con el hash que tengo guardado en la bd
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // firmo el token con id, correo y rol — el front lo guarda en localStorage
      const token = jwt.sign(
        { id: user.id_usuario, correo: user.correo, role: user.tipo },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        message: "Login existoso",
        token,
        user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo, role: user.tipo },
      });

    } catch (error) {
      return res.status(500).json({ message: "Error, no se pudo iniciar sesión" });
    }
  }
}

module.exports = AuthController;
