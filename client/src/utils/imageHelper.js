// src/utils/imageHelper.js
export const getCleanedImageUrl = (relativePath) => {
  if (!relativePath) return "";

  // Ambil dari .env, default fallback ke domain API kamu
  const API_URL = import.meta.env.VITE_API_URL || "https://api2.logikarya.my.id/api";

  // Hapus '/api' di akhir (jika ada)
  const BASE_URL = API_URL.replace(/\/api\/?$/, "");

  // Hapus slash berlebih di awal path
  const cleanPath = relativePath.replace(/^\/+/, "");

  return `${BASE_URL}/${cleanPath}`;
};
