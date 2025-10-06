import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import bgPink from "../../assets/bg-pink1.png";
import axiosClient from "../../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const Signup = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    address: '',
    zip_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Periksa status login saat komponen dimuat
  useEffect(() => {
    const userRole = Cookies.get('userRole');
    if (userRole) {
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const onChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // REFACTOR: Menggunakan axiosClient.post. Axios otomatis handle body dan credentials.
      await axiosClient.post('/auth/signup', form);
      
      setSuccess('Signup berhasil!');
      // TODO: redirect ke login/dashboard jika perlu
    } catch (err) {
      // REFACTOR: Menangani error dari Axios (non-2xx status code)
      const message = err.response?.data?.message || 'Terjadi kesalahan jaringan';
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
          <h1 className="text-4xl font-bold mb-2 text-elegantburgundy">Daftar Akun</h1>
          <p className="text-darkgray mb-8">Mari mulai dengan beberapa fakta tentang Anda.</p>

          {error && <div className="mb-3 text-elegantburgundy bg-softpink p-3 rounded-lg">{error}</div>}
          {success && <div className="mb-3 text-darkgray bg-green-200 p-3 rounded-lg">{success}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-darkgray">Nama Depan</label>
                <input name="first_name" value={form.first_name} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-darkgray">Nama Belakang</label>
                <input name="last_name" value={form.last_name} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Username</label>
              <input name="username" value={form.username} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required minLength={8} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Alamat</label>
              <input name="address" value={form.address} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-darkgray">Kode Pos</label>
              <input name="zip_code" value={form.zip_code} onChange={onChange} className="w-full border border-lightmauve rounded-lg px-3 py-2 bg-purewhite text-darkgray focus:outline-none focus:ring-2 focus:ring-elegantburgundy" required />
            </div>

            <button disabled={loading} className="w-full bg-elegantburgundy text-purewhite py-3 rounded-lg font-semibold hover:bg-softpink transition">
              {loading ? 'Memproses…' : 'Daftar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-darkgray">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-elegantburgundy hover:text-softpink">
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