import React, { useState } from 'react';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Contoh logika login, ganti dengan API call sesuai backend Anda
    if (!username || !password) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }
    // Implement login request ke API di sini
    setErrorMsg('');
    // Redirect atau tampilkan pesan lain berdasarkan respons
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-2">{errorMsg}</div>
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
