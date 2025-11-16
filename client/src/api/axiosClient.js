// shakilla_shop/client/src/api/axiosClient.js
import axios from "axios";

// Ambil BASE_URL API dari environment variable (Vite) atau gunakan default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// URL Root Server (misal: http://localhost:3001). Ini adalah basis untuk gambar.
const SERVER_ROOT_URL = API_URL.replace("/api", "");

export const IMAGE_BASE_URL = `${SERVER_ROOT_URL}/uploads`; // Menggunakan SERVER_ROOT_URL

const axiosClient = axios.create({
  baseURL: API_URL, // Digunakan untuk semua panggilan API (misal: /api/products)
});

// Interceptor untuk menyisipkan token JWT
axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error 401/403
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Akses ditolak atau token kedaluwarsa. Sesi dibersihkan.");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userId");
      window.location.reload(); // Paksa reload untuk redirect ke halaman login
    }
    return Promise.reject(error);
  }
);

export const getServerUrl = () => {
  return SERVER_ROOT_URL;
};

export default axiosClient;