const User = require("../models/user.model");
const ResetToken = require("../models/reset_token.model");
const { resetPasswordTemplate } = require("../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configuración del token: el secreto y la duración se leen del .env para no tenerlos escritos fijos en el código
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// URL del frontend: en producción se define en el .env; en desarrollo apunta al localhost
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// El transporter se crea una sola vez al cargar el módulo.
// Si se creara dentro de forgotPassword, se instanciaría en cada petición, lo cual es innecesario.
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
      // Extrae los campos obligatorios del cuerpo de la petición
      const { nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password } = req.body;

      // Si falta algún campo, se rechaza la petición antes de llegar a la base de datos
      if (!nombre || !apellido || !tipo_documento || !numero_documento || !fecha_nacimiento || !correo || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // Verifica que el correo no esté ya registrado antes de continuar
      const existingUser = await User.findByEmail(correo);
      if (existingUser) {
        return res.status(409).json({ message: "El correo ya esta registrado" });
      }

      // La contraseña nunca se guarda en texto plano; siempre se hashea con bcrypt usando salt 10
      const password_hash = await bcrypt.hash(password, 10);

      const userId = await User.create({ nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, correo, password_hash });

      return res.status(201).json({ message: "Usuario creado exitosamente", userId });

    } catch (error) {
      res.status(500).json({ message: "Error al crear un usuario" });
    }
  }


  // LOGIN
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // Si el usuario no existe, se responde igual que cuando la contraseña es incorrecta,
      // de esta forma no se revela si un correo está registrado o no
      const user = await User.findByEmail(correo);
      if (!user) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      // Aunque las credenciales sean válidas, un usuario inactivo no puede iniciar sesión
      if (user.estado !== "activo") {
        return res.status(403).json({ message: "Usuario inactivo" });
      }

      // Compara la contraseña enviada con el hash almacenado en la base de datos
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      // Firma el token con el id, correo y rol del usuario.
      // El frontend lo guarda en localStorage para enviarlo en cada petición posterior.
      const token = jwt.sign(
        { id: user.id_usuario, correo: user.correo, role: user.tipo },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        message: "Login exitoso",
        token,
        user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo, role: user.tipo },
      });

    } catch (error) {
      return res.status(500).json({ message: "Error, no se pudo iniciar sesion" });
    }
  }


  // FORGOT PASSWORD
  static async forgotPassword(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ message: "El correo es obligatorio" });
      }

      // Se busca el usuario pero la respuesta es siempre la misma, exista o no.
      // Si se respondiera diferente según el resultado, sería posible descubrir qué correos están registrados.
      const user = await User.findByEmail(correo);

      if (user) {
        // crypto.randomBytes genera aleatoriedad real a nivel de sistema operativo.
        // Math.random no es suficientemente seguro para tokens de recuperación.
        const token = crypto.randomBytes(32).toString("hex");

        // El token expira en 1 hora: Date.now() está en milisegundos, por eso se suma 60 * 60 * 1000
        const expires_at = new Date(Date.now() + 60 * 60 * 1000);

        await ResetToken.createToken(user.id_usuario, token, expires_at);

        // El enlace apunta al frontend. React lo recibe, extrae el token con useParams
        // y llama al servidor para completar el reset.
        const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

        await transporter.sendMail({
          from: `"BookSync" <${process.env.EMAIL_USER}>`,
          to: user.correo,
          subject: "Recuperar contrasena - BookSync",
          html: resetPasswordTemplate(user.nombre, resetLink),
        });
      }

      // La respuesta es siempre la misma para no revelar si el correo existe o no
      return res.status(200).json({
        message: "Si ese correo esta registrado, recibiras un enlace",
      });

    } catch (error) {
      // Se loguea el error real (ej. fallo de autenticación con Gmail) para poder diagnosticarlo desde los logs de Render
      console.error("error en forgotPassword:", error.message);
      return res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  }


  // RESET PASSWORD
  static async resetPassword(req, res) {
    try {
      const { token } = req.params; // El token llega como parámetro de la URL, no en el body
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "La contrasena es obligatoria" });
      }

      // findByToken ya valida la expiración en la misma consulta.
      // Si devuelve null, el enlace es inválido o ya expiró.
      const resetRecord = await ResetToken.findByToken(token);

      if (!resetRecord) {
        return res.status(400).json({ message: "El enlace no es valido o ya expiro" });
      }

      const password_hash = await bcrypt.hash(password, 10);

      // El id_usuario se toma del token guardado en la base de datos, no del frontend,
      // para evitar que alguien pueda cambiar la contraseña de otro usuario.
      await User.updatePassword(resetRecord.id_usuario, password_hash);

      // Se elimina el token una vez usado para que el enlace del correo no pueda volver a utilizarse
      await ResetToken.deleteByToken(token);

      return res.status(200).json({ message: "Contrasena actualizada correctamente" });

    } catch (error) {
      return res.status(500).json({ message: "Error al restablecer la contrasena" });
    }
  }
}

module.exports = AuthController;
