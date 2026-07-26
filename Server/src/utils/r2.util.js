const crypto = require("crypto");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("../config/r2");

// Sube la portada de un libro a R2 y devuelve la URL pública final
async function uploadCoverToR2(file) {
  const extension = path.extname(file.originalname);
  const key = `libros/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

module.exports = { uploadCoverToR2 };
