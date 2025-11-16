// client/src/pages/user/editProfile.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const EditProfileUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State tetap menggunakan snake_case agar mudah saat fetch data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "", // Sesuai model & migrasi
    address: "",
    zip_code: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Asumsi /users/profile mengembalikan data snake_case dari database
        const response = await axiosClient.get("/users/profile"); 
        const user = response.data.user;
        
        // Set state dengan data dari database
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          username: user.username || "",
          email: user.email || "",
          phone_number: user.phone_number || "", // Sesuai model
          address: user.address || "",
          zip_code: user.zip_code || "",
        });
      } catch (err) {
        setStatus({ type: "error", message: "Gagal memuat data." });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // --- PERBAIKAN PENTING ---
    // Controller Anda mengharapkan camelCase.
    // Kita harus memetakan state snake_case kita ke payload camelCase.
    const payload = {
      firstName: formData.first_name,
      lastName: formData.last_name,
      username: formData.username,
      email: formData.email, // Controller juga memvalidasi email
      address: formData.address,
      zipCode: formData.zip_code, // Sesuai controller
      phone: formData.phone_number // Controller mengharapkan 'phone'
    };
    // --- AKHIR PERBAIKAN ---

    try {
      // Kirim payload yang sudah di-map
      const response = await axiosClient.put("/users/profile", payload); 
      
      const newName = response.data.user?.first_name || response.data.user?.username;
      
      // Update session/cookie (sesuaikan dengan setup Anda)
      sessionStorage.setItem('userName', newName); 
      // Cookies.set('userName', newName, { expires: 1, path: '/' }); // Jika pakai Cookies

      setStatus({ type: "success", message: "Profil berhasil diperbarui!" });
      setTimeout(() => {
        navigate("/user/profile");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memperbarui profil.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.email) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={userMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray">
            Edit Profil
          </h1>
        </div>

        {status && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-darkgray">
                  Nama Depan
                </label>
                <input
                  type="text"
                  name="first_name" // Input name tetap snake_case
                  value={formData.first_name} // State value tetap snake_case
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-darkgray">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkgray">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled // Email tidak boleh diubah
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkgray">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phone_number" // Input name tetap snake_case
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkgray">
                Alamat
              </label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray">
                Kode Pos
              </label>
              <input
                type="text"
                name="zip_code" // Input name tetap snake_case
                value={formData.zip_code}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-purewhite bg-elegantburgundy hover:bg-softpink disabled:opacity-50"
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

export default EditProfileUser;