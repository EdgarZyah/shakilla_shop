import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient"; 

const EditProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) {
      setError("User tidak terautentikasi.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // FIX: Panggil endpoint profil yang benar
      const response = await axiosClient.get(`/users/profile`);
      const data = response.data.user;

      setFormData(data);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data profil.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Ambil data yang dikirim, menggunakan nama field yang benar sesuai backend (camelCase)
    const payload = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        username: formData.username,
        email: formData.email,
        address: formData.address,
        zipCode: formData.zip_code,
    }

    try {
      // FIX: Panggil endpoint update profil yang benar
      await axiosClient.put(`/users/profile`, payload);
      
      setStatus({ type: "success", message: "Profil berhasil diperbarui!" });
      setTimeout(() => {
          navigate("/user/profile");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memperbarui profil.";
      setStatus({ type: "error", message: message });
      console.error("Error updating user data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat form...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="text-center p-8 bg-purewhite rounded-lg shadow">
          <h1 className="text-2xl font-bold text-elegantburgundy mb-4">Error</h1>
          <p className="text-darkgray">{error}</p>
          <button onClick={() => navigate('/user/profile')} className="mt-4 text-elegantburgundy hover:underline">Kembali ke Profil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={userMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="max-w-4xl mx-auto bg-purewhite rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-darkgray">Edit Profil</h1>
            <button
              onClick={() => navigate("/user/profile")}
              className="text-darkgray hover:text-elegantburgundy transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {status && (
            <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === "success" ? "bg-softpink/50 text-darkgray" : "bg-softpink/50 text-elegantburgundy"}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSaveClick}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-darkgray">Nama Depan</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">Nama Belakang</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-darkgray">Alamat</label>
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">Kode Pos</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/user/profile")}
                className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;