const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Las portadas migradas a R2 ya vienen como URL absoluta; las que todavía no se han migrado
// son rutas locales relativas al servidor (/uploads/libros/...) y necesitan el prefijo del servidor.
export function getCoverUrl(cover) {
  if (!cover) return cover;

  if (cover.startsWith("http://") || cover.startsWith("https://")) {
    return cover;
  }

  return `${SERVER_URL}${cover}`;
}
