import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import axiosClient from "../../api/axiosClient"; 

const DashboardUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("User tidak terautentikasi.");
        setLoading(false);
        return;
      }
      try {
        const [userRes, ordersRes] = await Promise.all([
          // FIX: Mengganti endpoint ke /users/profile
          axiosClient.get(`/users/profile`), 
          // FIX: Panggil endpoint orders dengan filter user_id
          axiosClient.get(`/orders`, { params: { user_id: userId } }), 
        ]);

        const userData = userRes.data.user;
        const ordersData = ordersRes.data.orders;

        setUserData(userData);

        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          setOrders([]);
        }

      } catch (err) {
        const message = err.response?.data?.message || "Gagal mengambil data. Silakan coba login ulang.";
        setError(message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "menunggu pembayaran":
        return "bg-softpink/50 text-elegantburgundy";
      case "diproses":
      case "dikirim":
      case "diterima":
      case "verified":
      case "selesai":
        return "bg-elegantburgundy/50 text-purewhite";
      case "dibatalkan": 
        return "bg-red-500 text-purewhite";
      default:
        return "bg-lightmauve text-darkgray";
    }
  };

  const getDisplayStatus = (order) => {
    return order.order_status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        return new Date(dateString).toLocaleDateString("id-ID", options);
    } catch (e) {
        console.error("Invalid date format:", e);
        return "N/A";
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat dashboard...</span>
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
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-softpink/50 text-elegantburgundy p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Sambutan & Ringkasan Profil */}
          {userData && (
              <div className="bg-purewhite rounded-lg shadow-lg p-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-darkgray mb-2">
                  Selamat Datang, {userData?.first_name}!
                </h1>
                <p className="text-darkgray mb-4">
                  Dashboard ini menyediakan ringkasan aktivitas akun Anda.
                </p>
                <div className="border-t border-lightmauve pt-4">
                  <h2 className="text-xl font-semibold text-darkgray mb-2">Informasi Akun</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-darkgray">
                    <p><strong>Nama Lengkap:</strong> {userData?.first_name} {userData?.last_name}</p>
                    <p><strong>Username:</strong> {userData?.username}</p>
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Alamat:</strong> {userData?.address || "Belum diisi"}</p>
                  </div>
                </div>
              </div>
          )}
          
          {/* Riwayat Pesanan Terbaru */}
          <div className="bg-purewhite rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-darkgray mb-4">Pesanan Terbaru Anda</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-darkgray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="mt-2 text-lg font-medium text-darkgray">
                  Tidak ada pesanan yang ditemukan.
                </p>
                <p className="mt-1 text-sm text-darkgray/70">
                  Mulai berbelanja sekarang!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="border-b border-lightmauve pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-darkgray">
                        Pesanan #{order.id}
                      </h3>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(getDisplayStatus(order))}`}>
                        {getDisplayStatus(order)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-darkgray">
                      <span>Total:</span>
                      <span className="font-semibold text-darkgray">
                        Rp {order.total_price?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-sm text-darkgray/70 mt-1">
                      Pesanan dibuat pada: {formatDate(order.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardUser;