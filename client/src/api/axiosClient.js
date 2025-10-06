import axios from 'axios';

// Gunakan environment variable VITE_API_URL untuk URL base.
// Jika tidak ada, fallback ke hardcode URL saat ini.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
/* const API_BASE_URL = import.meta.env.VITE_API_URL || "http://api2.logikarya.my.id/api"; */

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Penting: Mengizinkan pengiriman cookies, menggantikan fetch options: { credentials: 'include' }
  withCredentials: true,
});

// Interceptor opsional untuk penanganan error/refresh token global
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;