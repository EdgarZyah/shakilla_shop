// shakilla_shop/client/src/pages/user/orders.jsx
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import axiosClient from "../../api/axiosClient"; 

// FIX: Fungsi untuk memperbaiki parsing tanggal MySQL (YYYY-MM-DD HH:MM:SS)
// Format tanggal MySQL & ISO agar selalu bisa dibaca
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    let parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(dateString.replace(" ", "T"));
    }

    if (isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};



const Orders = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [userData, setUserData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const accessToken = sessionStorage.getItem('accessToken');
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

  const fetchOrders = useCallback(async () => {
    if (!accessToken || !userId) {
      setError("User tidak terautentikasi.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const ordersRes = await axiosClient.get(`/orders`, { params: { user_id: userId } });
      const ordersData = ordersRes.data.orders;
      
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data pesanan.";
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        navigate('/login', { replace: true });
        return;
      }
      if (!userId) return; 
      
      try {
        const userRes = await axiosClient.get(`/users/profile`);
        const userData = userRes.data.user;
        
        setUserData(userData);
        await fetchOrders();
      } catch (err) {
        const message = err.response?.data?.message || "Gagal mengambil data profil.";
        setError(message);
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [accessToken, userId, fetchOrders, navigate]);

  const handleUploadProof = async (e) => {
    e.preventDefault();
    
    const uploadUrl = `/payments/upload`;
    
    if (!paymentProofFile || !allowedTypes.includes(paymentProofFile.type)) {
      setUploadStatus({ type: 'error', message: 'Hanya file gambar (JPEG, PNG, WEBP, HEIC, HEIF) yang diizinkan.' });
      return;
    }

    setUploadStatus({ type: 'loading', message: 'Mengunggah bukti pembayaran...' });

    const formData = new FormData();
    formData.append('order_id', selectedOrder.id);
    formData.append('payment_proof', paymentProofFile); 

    try {
      await axiosClient.post(uploadUrl, formData);

      setUploadStatus({ type: 'success', message: 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.' });
      setPaymentProofFile(null);
      
      setTimeout(async () => {
        await fetchOrders();
        setShowUploadModal(false);
        setUploadStatus(null);
      }, 2000);

    } catch (err) {
      const message = err.response?.data?.message || 'Gagal mengunggah bukti pembayaran (Error 500). Coba lagi atau hubungi admin.';
      setUploadStatus({ type: 'error', message: message });
      console.error('Error in handleUploadProof:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "menunggu pembayaran":
      case "menunggu verifikasi": 
        return "bg-softpink/50 text-elegantburgundy";
      case "diproses":
      case "dikirim":
      case "diterima":
      case "verified":
        return "bg-elegantburgundy/50 text-purewhite";
      case "selesai":
        return "bg-elegantburgundy text-purewhite";
      case "dibatalkan": 
        return "bg-red-500 text-purewhite";
      default:
        return "bg-lightmauve text-darkgray";
    }
  };
  
  
  const handleViewDetail = async (order) => {
      try {
          const res = await axiosClient.get(`/orders/${order.id}`);
          const detailedOrder = res.data.order;
          setSelectedOrder({ ...detailedOrder, User: userData });
          setShowDetailModal(true);
      } catch (err) {
          alert("Gagal memuat detail pesanan. " + (err.response?.data?.message || 'Kesalahan jaringan.'));
          console.error("Error fetching order detail:", err);
      }
  };
  
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentOrders = orders.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const orderTableColumns = [
    { key: 'id', label: 'ID Pesanan', render: (order) => `#${order.id}` },
        { 
  key: 'createdAt', label: 'Tanggal Pesanan',sortable: true,
  render: (order) => formatDate(order.created_at || order.createdAt)
},
    { key: 'total_price', label: 'Total Harga', render: (order) => `Rp ${parseFloat(order.total_price || 0)?.toLocaleString("id-ID")}` },
    {
      key: 'order_status', 
      label: 'Status Pesanan',
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.order_status)}`}>
          {order.order_status || "N/A"}
        </span>
      ),
    },
  ];

  const renderActions = (order) => (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleViewDetail(order)}
        className="text-elegantburgundy hover:text-softpink transition-colors"
      >
        Detail
      </button>
      {(order.order_status === 'pending' || order.order_status === 'menunggu pembayaran') && (
        <button
          onClick={() => { setSelectedOrder(order); setShowUploadModal(true); }}
          className="text-elegantburgundy hover:text-softpink transition-colors"
        >
          Upload Bukti
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat data pesanan...</span>
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
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
              Pesanan Saya
            </h1>
            <p className="text-darkgray/70">
              Lihat riwayat pesanan Anda dan status pengirimannya.
            </p>
          </div>
          
          {error && (
            <div className="bg-softpink/50 text-elegantburgundy p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-hidden">
            <Table
              columns={orderTableColumns}
              data={currentOrders}
              loading={loading}
              onSort={() => {}}
              sortBy={null}
              sortOrder={null}
              renderActions={renderActions}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      
        <OrderDetailModal 
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          order={selectedOrder}
        />

        {showUploadModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-purewhite p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-darkgray">Unggah Bukti Pembayaran (#{selectedOrder.id})</h3>
              {uploadStatus && (
                <div className={`p-3 rounded-md mb-4 text-sm ${uploadStatus.type === 'success' ? 'bg-softpink/50 text-darkgray' : 'bg-softpink/50 text-elegantburgundy'}`}>
                  {uploadStatus.message}
                </div>
              )}
              <form onSubmit={handleUploadProof}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-darkgray">Pilih File</label>
                  <input 
                    type="file" 
                    accept={allowedTypes.join(',')}
                    onChange={(e) => setPaymentProofFile(e.target.files[0])} 
                    className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink transition"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowUploadModal(false); setUploadStatus(null); }}
                    className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!paymentProofFile || uploadStatus?.type === 'loading'}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition disabled:opacity-50"
                  >
                    Unggah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;