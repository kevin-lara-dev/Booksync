const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("../config/r2");

const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// Sube la portada de un libro a R2 y devuelve la URL pública final
async function uploadCoverToR2(file) {
  const extension = MIME_TO_EXT[file.mimetype] || ".jpg";
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
