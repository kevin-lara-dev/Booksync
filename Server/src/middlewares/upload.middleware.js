const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// memoryStorage porque el disco de Render es efímero — el archivo se sube a R2 directo desde el buffer, sin tocar disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Formato de imagen no soportado. Usa JPG, PNG o WEBP"));
    }
    cb(null, true);
  },
});

module.exports = upload;
