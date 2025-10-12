import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // --- PERBAIKAN UTAMA: Membaca dari sessionStorage ---
  const token = sessionStorage.getItem('accessToken'); 
  const userRole = sessionStorage.getItem('userRole');

  if (!token || !userRole) {
    // Jika token atau role tidak ada, redirect ke halaman login.
    // Jika ada Cookies.get('userId'), ini harusnya sudah dihapus oleh axios interceptor jika token expired
    return <Navigate to="/login" replace />;
  }

  // Periksa apakah peran pengguna sesuai dengan peran yang dibutuhkan.
  if (userRole !== requiredRole) {
    // Peran tidak cocok, arahkan ke dashboard yang sesuai (jika ada role, tapi salah role)
    if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  // Jika peran cocok, tampilkan konten halaman yang dilindungi.
  return children;
};

export default ProtectedRoute;
