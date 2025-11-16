// client/src/pages/user/profile.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { 
  FaEnvelope, 
  FaPhone,        // <-- TAMBAHAN BARU
  FaHome, 
  FaMapMarkerAlt, // <-- TAMBAHAN BARU
  FaEdit,
  FaUser          // <-- TAMBAHAN BARU
} from "react-icons/fa";

const ProfileUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Controller '/users/profile' sudah mengembalikan semua data
        const response = await axiosClient.get("/users/profile"); 
        setUserData(response.data.user);
      } catch (err) {
        setError("Gagal memuat data profil.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        Memuat data profil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center text-red-600">
        {error}
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray">
            Profil Saya
          </h1>
          <Link
            to="/user/edit-profile"
            className="flex items-center gap-2 bg-elegantburgundy text-purewhite px-4 py-2 rounded-lg shadow hover:bg-softpink transition"
          >
            <FaEdit />
            <span>Edit Profil</span>
          </Link>
        </div>

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-darkgray">
                {userData?.first_name} {userData?.last_name}
              </h2>
              <p className="text-darkgray/70 capitalize">
                {userData?.role}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-lightmauve pt-6">
            <h3 className="text-lg font-semibold text-darkgray mb-4">
              Informasi Kontak & Akun
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-darkgray">
              
              {/* Username */}
              <li className="flex items-center gap-3">
                <FaUser className="text-elegantburgundy w-4 text-center" />
                <span>{userData?.username || "Belum diatur"}</span>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-elegantburgundy w-4 text-center" />
                <span>{userData?.email || "Belum diatur"}</span>
              </li>
              
              {/* Nomor Telepon */}
              <li className="flex items-center gap-3">
                <FaPhone className="text-elegantburgundy w-4 text-center" />
                <span>{userData?.phone_number || "Nomor HP belum diatur"}</span>
              </li>

              {/* Kode Pos */}
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-elegantburgundy w-4 text-center" />
                <span>
                  Kode Pos: {userData?.zip_code || "Belum diatur"}
                </span>
              </li>

              {/* Alamat */}
              <li className="flex items-start gap-3 col-span-1 md:col-span-2">
                <FaHome className="text-elegantburgundy w-4 text-center mt-1 flex-shrink-0" />
                <span className="whitespace-pre-wrap">
                  {userData?.address || "Alamat belum diatur"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileUser;