/*
  Migra las portadas ya existentes en Server/uploads/libros/ a Cloudflare R2.

  Por cada archivo:
    - lo sube a R2 bajo el key `libros/<nombre-original>`
    - actualiza en la tabla `libro` el registro cuyo cover sea '/uploads/libros/<nombre-original>'
      para que apunte a la nueva URL pública de R2

  Es seguro correrlo más de una vez: si un libro ya fue migrado, su `cover` ya no coincide
  con la ruta local ('/uploads/libros/...'), así que el UPDATE simplemente no encuentra filas.
  Subir el mismo archivo dos veces a R2 tampoco es un problema, sobreescribe el mismo key.

  Uso: node scripts/migrate-covers-to-r2.js
*/

const fs = require("fs");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("../src/config/r2");
const pool = require("../src/config/db");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "libros");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function uploadFileToR2(filename) {
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filename).toLowerCase();
  const key = `libros/${filename}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: MIME_TYPES[extension] || "application/octet-stream",
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

async function migrate() {
  const summary = { uploaded: 0, updated: 0, notFoundInDb: 0, errors: [] };

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`No existe el directorio ${UPLOADS_DIR}, nada que migrar.`);
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter((f) =>
    fs.statSync(path.join(UPLOADS_DIR, f)).isFile(),
  );

  console.log(`Encontrados ${files.length} archivo(s) en ${UPLOADS_DIR}`);

  for (const filename of files) {
    try {
      const newUrl = await uploadFileToR2(filename);
      summary.uploaded++;

      const oldCover = `/uploads/libros/${filename}`;
      const [result] = await pool.query(
        "UPDATE libro SET cover = ? WHERE cover = ?",
        [newUrl, oldCover],
      );

      if (result.affectedRows > 0) {
        summary.updated += result.affectedRows;
        console.log(`OK  ${filename} -> ${newUrl} (${result.affectedRows} fila(s) actualizadas)`);
      } else {
        summary.notFoundInDb++;
        console.log(`--  ${filename} subido a R2, pero ningún libro tenía cover = '${oldCover}' (ya migrado o no referenciado)`);
      }
    } catch (error) {
      summary.errors.push({ filename, message: error.message });
      console.error(`ERROR ${filename}: ${error.message}`);
    }
  }

  console.log("\nResumen de migración:");
  console.log(`  Archivos subidos a R2: ${summary.uploaded}`);
  console.log(`  Registros actualizados en la BD: ${summary.updated}`);
  console.log(`  Archivos sin coincidencia en la BD: ${summary.notFoundInDb}`);
  console.log(`  Errores: ${summary.errors.length}`);

  if (summary.errors.length > 0) {
    summary.errors.forEach((e) => console.log(`    - ${e.filename}: ${e.message}`));
  }

  await pool.end();
}

migrate();
