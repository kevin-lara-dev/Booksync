const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config({ override: false });

// Cloudflare R2 expone una API compatible con S3, por eso se usa el SDK de AWS apuntando a su endpoint
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = r2Client;
