// shakilla_shop/client/src/pages/user/orders.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import { useNavigate, Link } from "react-router-dom";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import axiosClient from "../../api/axiosClient";
// import useDebounce from "../../hooks/useDebounce"; // <-- PERUBAHAN 1: Dihapus

const formatDate = (dateString) => {
  // ... (fungsi tidak berubah)
  if (!dateString) return "N/A";
  try {
    let parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(dateString.replace(" ", "T"));
    }
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleString("id-ID", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "N/A"; }
};

// Helper untuk sorting
const getNestedValue = (obj, path) => path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);

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

  // --- State untuk Search & Sort ---
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(""); // <-- PERUBAHAN 2: Ditambahkan
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  // const debouncedSearchTerm = useDebounce(searchTerm, 300); // <-- PERUBAHAN 3: Dihapus
  // --- Akhir State ---

  const accessToken = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

  const fetchOrders = useCallback(async () => {
    // ... (fungsi tidak berubah)
    if (!accessToken || !userId) {
      setError("User tidak terautentikasi."); setLoading(false); return;
    }
    try {
      setLoading(true);
      const ordersRes = await axiosClient.get(`/orders`, { params: { user_id: userId } });
      const ordersData = ordersRes.data.orders;
      setOrders(ordersData); setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data pesanan.";
      setError(message); setOrders([]);
    } finally { setLoading(false); }
  }, [accessToken, userId]);

  useEffect(() => {
    // ... (fungsi tidak berubah)
     const fetchData = async () => {
      if (!accessToken) { navigate("/login", { replace: true }); return; }
      if (!userId) return;
      try {
        const userRes = await axiosClient.get(`/users/profile`);
        const userData = userRes.data.user;
        setUserData(userData); await fetchOrders();
      } catch (err) {
        const message = err.response?.data?.message || "Gagal mengambil data profil.";
        setError(message); console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [accessToken, userId, fetchOrders, navigate]);

  const handleUploadProof = async (e) => {
    // ... (fungsi tidak berubah)
    e.preventDefault();
    const uploadUrl = `/payments/upload`;
    if (!paymentProofFile || !allowedTypes.includes(paymentProofFile.type)) {
      setUploadStatus({ type: "error", message: "Hanya file gambar (JPEG, PNG, WEBP, HEIC, HEIF) yang diizinkan." }); return;
    }
    setUploadStatus({ type: "loading", message: "Mengunggah bukti pembayaran..." });
    const formData = new FormData();
    formData.append("order_id", selectedOrder.id);
    formData.append("payment_proof", paymentProofFile);
    try {
      await axiosClient.post(uploadUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadStatus({ type: "success", message: "Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin." });
      setPaymentProofFile(null);
      setTimeout(async () => {
        await fetchOrders(); setShowUploadModal(false); setUploadStatus(null);
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengunggah bukti pembayaran. Coba lagi atau hubungi admin.";
      setUploadStatus({ type: "error", message: message }); console.error("Error in handleUploadProof:", err);
    }
  };

  const getStatusBadge = (status) => {
    // ... (fungsi tidak berubah)
    switch (status) {
      case "pending": case "menunggu pembayaran": case "menunggu verifikasi": return "bg-softpink/50 text-elegantburgundy";
      case "diproses": case "dikirim": case "diterima": case "verified": return "bg-elegantburgundy/50 text-purewhite";
      case "selesai": return "bg-elegantburgundy text-purewhite";
      case "dibatalkan": return "bg-red-500 text-purewhite";
      default: return "bg-lightmauve text-darkgray";
    }
  };

  const handleViewDetail = async (order) => {
    // ... (fungsi tidak berubah)
    try {
      const res = await axiosClient.get(`/orders/${order.id}`);
      const detailedOrder = res.data.order;
      setSelectedOrder({ ...detailedOrder, User: userData });
      setShowDetailModal(true);
    } catch (err) {
      alert("Gagal memuat detail pesanan. " + (err.response?.data?.message || "Kesalahan jaringan."));
      console.error("Error fetching order detail:", err);
    }
  };

  // --- Logika Filter & Sort ---
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const searchLower = searchTerm.toLowerCase(); // <-- PERUBAHAN 4: Diubah ke searchTerm
        // Cari berdasarkan ID Order atau Status
        return (
          `#${order.id}`.includes(searchLower) ||
          order.order_status?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;

        if (sortBy === 'created_at' || sortBy === 'updated_at') {
          // Sort by date
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return sortOrder === "asc" ? -1 : 1;
          if (isNaN(dateB)) return sortOrder === "asc" ? 1 : -1;
          const result = dateA - dateB;
          return sortOrder === "asc" ? result : -result;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          // Sort numerically (ID, grand_total)
           const result = aValue - bValue;
           return sortOrder === 'asc' ? result : -result;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Sort alphabetically (status)
          const result = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? result : -result;
        }
        return 0; // Default case
      });
  }, [orders, searchTerm, sortBy, sortOrder]); // <-- PERUBAHAN 5: Dependensi diubah
  // --- Akhir Logika Filter & Sort ---

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Fungsi Handle Sort ---
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
     setCurrentPage(1); // Reset ke halaman 1 saat sorting
  };
  // --- Akhir Fungsi Handle Sort ---

  // <-- PERUBAHAN 6: Handler untuk Submit Form ditambahkan ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };
  // --------------------------------------------------------

  const orderTableColumns = [
    {
      key: "no", label: "NO",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: "id", label: "ID Pesanan", sortable: true, render: (order) => `#${order.id}` },
    {
      key: "created_at", label: "Tanggal Pesanan", sortable: true,
      render: (order) => formatDate(order.created_at || order.createdAt),
    },
    {
      key: "grand_total", label: "Total Harga", sortable: true,
      render: (order) => `Rp ${parseFloat(order.grand_total || 0)?.toLocaleString("id-ID")}`,
    },
    {
      key: "order_status", label: "Status Pesanan", sortable: true,
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadge(order.order_status)}`}>
          {order.order_status?.replace(/_/g, ' ') || "N/A"}
        </span>
      ),
    },
  ];

  const renderActions = (order) => (
    // ... (fungsi tidak berubah)
     <div className="flex flex-wrap gap-2 items-center">
      <button onClick={() => handleViewDetail(order)} className="text-elegantburgundy hover:text-softpink transition-colors text-sm"> Detail </button>
      {(order.order_status === "pending" || order.order_status === "menunggu pembayaran") && (
        <>
          <Link to={`/payment/${order.id}`} className="text-green-600 hover:text-green-800 font-medium transition-colors text-sm"> Bayar </Link>
          <button onClick={() => { setSelectedOrder(order); setShowUploadModal(true); }} className="text-elegantburgundy hover:text-softpink transition-colors text-sm"> Upload Bukti </button>
        </>
      )}
    </div>
  );

  if (loading && orders.length === 0) { // Tampilkan loading hanya jika belum ada data
     return (
       <div className="flex min-h-screen bg-lightmauve items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
       </div>
     );
  }

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={userMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2"> Pesanan Saya </h1>
            <p className="text-darkgray/70"> Lihat riwayat pesanan Anda dan status pengirimannya. </p>
          </div>
          {error && <div className="bg-softpink/50 text-elegantburgundy p-4 rounded-lg mb-6"> {error} </div>}

          {/* --- Search Bar (PERUBAHAN 7: Diubah menjadi Form) --- */}
          <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
             <form className="relative" onSubmit={handleSearchSubmit}>
               <input
                 type="text"
                 placeholder="Cari berdasarkan ID Pesanan atau Status..."
                 value={inputValue} // <-- Diubah
                 onChange={(e) => setInputValue(e.target.value)} // <-- Diubah
                 className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
               />
               <svg className="absolute left-3 top-2.5 w-5 h-5 text-darkgray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </form>
             <div className="mt-2 text-sm text-darkgray/70">
                 Menampilkan {currentOrders.length} dari {filteredAndSortedOrders.length} pesanan
             </div>
          </div>
          {/* --- Akhir Search Bar --- */}

          <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-hidden">
            <Table
              columns={orderTableColumns}
              data={currentOrders}
              loading={loading} // Tetap tampilkan loading spinner di tabel jika sedang fetch ulang
              onSort={handleSort} // Pass handler
              sortBy={sortBy}     // Pass state
              sortOrder={sortOrder} // Pass state
              renderActions={renderActions}
            />
          </div>
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
        </div>
        {/* ... (Modal tidak berubah) ... */}
         <OrderDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} order={selectedOrder} userRole="user" />
        {showUploadModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-purewhite p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-darkgray"> Unggah Bukti Pembayaran (#{selectedOrder.id}) </h3>
              {uploadStatus && <div className={`p-3 rounded-md mb-4 text-sm ${uploadStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}> {uploadStatus.message} </div>}
              <form onSubmit={handleUploadProof}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-darkgray"> Total: Rp {parseFloat(selectedOrder.grand_total || 0).toLocaleString("id-ID")} </label>
                  <label className="block text-sm font-medium text-darkgray mt-2"> Pilih File Gambar </label>
                  <input type="file" accept={allowedTypes.join(",")} onChange={(e) => setPaymentProofFile(e.target.files[0])} className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink transition" required />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowUploadModal(false); setUploadStatus(null); setPaymentProofFile(null); }} className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition"> Batal </button>
                  <button type="submit" disabled={!paymentProofFile || uploadStatus?.type === "loading"} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition disabled:opacity-50"> {uploadStatus?.type === "loading" ? "Mengunggah..." : "Unggah"} </button>
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