import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import bgPink from "../../assets/bg-pink1.png";
import axiosClient from "../../api/axiosClient";

const Signup = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "", // <-- TAMBAHAN BARU
    password: "",
    address: "",
    zip_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Hapus state 'success' karena kita akan auto-redirect
  // const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Periksa status login saat komponen dimuat
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

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // setSuccess(''); // Tidak perlu lagi

    // Validasi frontend sederhana
    if (form.password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      setLoading(false);
      return;
    }

    try {
      // Menjadi '/auth/signup' agar sesuai dengan authRoutes.js
      const response = await axiosClient.post("/auth/signup", form);

      // --- LOGIKA AUTO-LOGIN & REDIRECT ---
      const { token, user } = response.data;

      // Set Cookies agar konsisten dengan pengecekan di useEffect
      Cookies.set("accessToken", token, { expires: 1, path: "/" });
      Cookies.set("userRole", user.role, { expires: 1, path: "/" });
      Cookies.set("userName", user.first_name || user.username, {
        expires: 1,
        path: "/",
      });

      // Redirect ke dashboard yang sesuai
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
      // ------------------------------------
    } catch (err) {
      const message =
        err.response?.data?.message || "Terjadi kesalahan jaringan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-lightmauve text-darkgray">
      {/* Kolom Kiri untuk Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-elegantburgundy">
            Daftar Akun
          </h1>
          <p className="text-darkgray mb-8">
            Buat akun Anda dan mulai perjalanan belanja yang lebih menyenangkan.
          </p>

          {error && (
            <div className="mb-3 text-elegantburgundy bg-softpink p-3 rounded-lg">
              {error}
            </div>
          )}
          {/* Pesan sukses dihapus karena auto-redirect */}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-darkgray">
                  Nama Depan
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-darkgray">
                  Nama Belakang
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Email
              </label>
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
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Alamat
              </label>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">
                Kode Pos
              </label>
              <input
                name="zip_code"
                value={form.zip_code}
                onChange={onChange}
                className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-elegantburgundy text-purewhite py-3 rounded-lg font-semibold hover:bg-softpink transition"
            >
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-darkgray">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-elegantburgundy hover:text-softpink"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>

      {/* Kolom Kanan Gambar (hanya tampil di layar md ke atas) */}
      <div
        className="hidden md:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPink})` }}
      ></div>
    </div>
  );
};

export default Signup;
