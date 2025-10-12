import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import bgPink from "../../assets/bg-pink1.png";
import axiosClient from "../../api/axiosClient"; 

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Periksa status login saat komponen dimuat (digunakan untuk auto-redirect jika sudah login)
  useEffect(() => {
    // Membaca dari sessionStorage
    const userRole = sessionStorage.getItem('userRole'); 
    if (userRole) {
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'user') {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await axiosClient.post("/auth/login", form);
      const data = res.data; 
      
      // --- PERBAIKAN UTAMA: Simpan data otentikasi ke sessionStorage ---
      sessionStorage.setItem("accessToken", data.token);
      sessionStorage.setItem("userRole", data.user.role);
      sessionStorage.setItem("userId", data.user.id);
      
      setSuccess("Login berhasil");
      
      // Logika Redirection Berdasarkan Role
      if (data.user.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.user.role === 'user') {
        navigate("/user/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      
    } catch (err) {
      const message = err.response?.data?.message || "Terjadi kesalahan jaringan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-lightmauve text-darkgray">
      {/* Kolom Kiri (Formulir) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-elegantburgundy">Masuk</h1>
          <p className="text-darkgray mb-8">Masuk ke akun Anda untuk melanjutkan.</p>

          {error && <div className="mb-3 text-elegantburgundy bg-softpink p-3 rounded-lg">{error}</div>}
          {success && <div className="mb-3 text-darkgray bg-green-200 p-3 rounded-lg">{success}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-elegantburgundy text-purewhite py-3 rounded-lg font-semibold hover:bg-softpink transition"
            >
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-darkgray">
            Belum punya akun?{" "}
            <Link to="/signup" className="font-semibold text-elegantburgundy hover:text-softpink">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      {/* Kolom Kanan (Gambar) */}
      <div
        className="hidden md:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPink})` }}
      ></div>
    </div>
  );
};

export default Login;
