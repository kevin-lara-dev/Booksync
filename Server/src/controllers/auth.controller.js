// TODO: en el futuro implementar refresh token y blacklist para el logout real

const User = require("../models/user.model");
const ResetToken = require("../models/reset_token.model");
const { resetPasswordTemplate } = require("../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// saco el secret y la expiracion del .env pa no tenerlos hardcodeados
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// creo el transporter una sola vez al cargar el modulo, no dentro del metodo
// si lo creara dentro de forgotPassword se instanciaria en cada request
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class AuthController {
  // REGISTRO
  static async register(req, res) {
    try {
      // saco todo lo que necesito del body
      const {
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        fecha_nacimiento,
        correo,
        password,
      } = req.body;

      // si falta algo rechazo antes de ir a la bd
      if (
        !nombre ||
        !apellido ||
        !tipo_documento ||
        !numero_documento ||
        !fecha_nacimiento ||
        !correo ||
        !password
      ) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // no dejo registrar el mismo correo dos veces
      const existingUser = await User.findByEmail(correo);
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "El correo ya esta registrado" });
      }

      // nunca guardo la contrasena en texto plano, siempre hasheada con salt 10
      const password_hash = await bcrypt.hash(password, 10);

      const userId = await User.create({
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        fecha_nacimiento,
        correo,
        password_hash,
      });

      return res
        .status(201)
        .json({ message: "Usuario creado exitosamente", userId });
    } catch (error) {
      res.status(500).json({ message: "Error al crear un usuario" });
    }
  }

  // LOGIN
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // busco el usuario, si no existe respondo lo mismo que si la contrasena es incorrecta
      // asi no le doy pistas a nadie de si un correo existe o no
      const user = await User.findByEmail(correo);
      if (!user) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      // aunque las credenciales sean correctas, un usuario inactivo no puede entrar
      if (user.estado !== "activo") {
        return res.status(403).json({ message: "Usuario inactivo" });
      }

      // comparo lo que llego con el hash que tengo guardado en la bd
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      // firmo el token con id, correo y rol, el front lo guarda en localStorage
      const token = jwt.sign(
        { id: user.id_usuario, correo: user.correo, role: user.tipo },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      return res.status(200).json({
        message: "Login exitoso",
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          role: user.tipo,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error, no se pudo iniciar sesion" });
    }
  }

  // FORGOT PASSWORD
  static async forgotPassword(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ message: "El correo es obligatorio" });
      }

      // busco el usuario pero respondo igual exista o no
      // si respondiera diferente alguien podria usar esto pa saber que correos estan registrados
      const user = await User.findByEmail(correo);

      if (user) {
        // crypto.randomBytes es aleatoriedad real del SO, Math.random no sirve pa esto
        const token = crypto.randomBytes(32).toString("hex");

        // 1 hora en ms: Date.now() esta en ms, entonces sumo 60 * 60 * 1000
        const expires_at = new Date(Date.now() + 60 * 60 * 1000);

        await ResetToken.createToken(user.id_usuario, token, expires_at);

        // el link apunta al front, react lo recibe, lee el token con useParams y llama al back
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
          from: `"BookSync" <${process.env.EMAIL_USER}>`,
          to: user.correo,
          subject: "Recuperar contrasena - BookSync",
          html: resetPasswordTemplate(user.nombre, resetLink),
        });
      }

      // respondo siempre lo mismo pa no revelar si el correo existe o no
      return res.status(200).json({
        message: "Si ese correo esta registrado, recibiras un enlace",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al procesar la solicitud" });
    }
  }

  // RESET PASSWORD
  static async resetPassword(req, res) {
    try {
      const { token } = req.params; // viene en la URL, no en el body
      const { password } = req.body;

      if (!password) {
        return res
          .status(400)
          .json({ message: "La contrasena es obligatoria" });
      }

      // findByToken ya verifica la expiracion, si devuelve null rechazo sin preguntar mas
      const resetRecord = await ResetToken.findByToken(token);

      if (!resetRecord) {
        return res
          .status(400)
          .json({ message: "El enlace no es valido o ya expiro" });
      }

      const password_hash = await bcrypt.hash(password, 10);

      // el id_usuario sale del token, no del front, asi el front no puede manipular a quien afecta
      await User.updatePassword(resetRecord.id_usuario, password_hash);

      // borro el token pa que el link no pueda reutilizarse
      await ResetToken.deleteByToken(token);

      return res
        .status(200)
        .json({ message: "Contrasena actualizada correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al restablecer la contrasena" });
    }
  }
}

module.exports = AuthController;
