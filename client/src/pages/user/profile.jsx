import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu"; 
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient"; 

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const data = response.data;
      
      setUserData(data.user); 
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data profil.";
      setError(message);
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat data profil...</span>
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
          <h1 className="text-3xl font-bold text-darkgray mb-6">Profil Pengguna</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-darkgray">
              <div>
                <p className="text-sm font-medium">Nama Depan</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2">{userData?.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nama Belakang</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2">{userData?.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2">{userData?.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2">{userData?.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Alamat</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2 min-h-[50px]">{userData?.address || "Belum diisi"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Kode Pos</p>
                <p className="mt-1 block w-full bg-lightmauve border border-lightmauve rounded-md p-2">{userData?.zip_code || "Belum diisi"}</p>
              </div>
          </div>

          <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/user/edit-profile")}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition"
              >
                Edit Profil
              </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;