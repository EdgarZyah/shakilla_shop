import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = Cookies.get('userRole');

  if (!userRole) {
    // Jika tidak ada cookie 'userRole', berarti pengguna belum login.
    // Lakukan redirect ke halaman login.
    return <Navigate to="/login" replace />;
  }

  // Periksa apakah peran pengguna sesuai dengan peran yang dibutuhkan.
  if (userRole !== requiredRole) {
    // Peran tidak cocok, arahkan ke beranda atau halaman lain.
    return <Navigate to="/" replace />;
  }

  // Jika peran cocok, tampilkan konten halaman yang dilindungi.
  return children;
};

export default ProtectedRoute;