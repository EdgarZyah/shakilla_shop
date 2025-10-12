import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axiosClient from '../../api/axiosClient'; 

const LoginForm = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setErrorMsg(''); 

    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi');
      return;
    }

    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      // Ambil token dan user dari body respons (sesuai output server Anda)
      const { token, user } = response.data;
      const role = user.role;

      // --- Perbaikan Utama: Simpan Token dan Role ke localStorage ---
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", role); 
      
      // Logika Redirection Berdasarkan Role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'user') {
        navigate('/user/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Email atau password salah.';
      setErrorMsg(message);
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-2">
          {errorMsg}
        </div>
      )}
      <div>
        <label className="block mb-1 text-gray-600 text-sm">Username</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan username"
        />
      </div>
      <div>
        <label className="block mb-1 text-gray-600 text-sm">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 transition"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
