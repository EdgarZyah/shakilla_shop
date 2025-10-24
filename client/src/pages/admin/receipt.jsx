// client/src/pages/admin/receipt.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import ModalHapus from "../../components/modalHapus";
import axiosClient from "../../api/axiosClient";
// import useDebounce from "../../hooks/useDebounce"; // Hook Debounce tidak lagi digunakan

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const safeDateString = dateString.replace(" ", "T");
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  try {
    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("id-ID", options);
  } catch { return "N/A"; }
};

// Helper untuk sorting
const getNestedValue = (obj, path) => path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);


const Receipt = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [shipStatus, setShipStatus] = useState({ type: "", message: "" });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- State untuk Search & Sort ---
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(""); // <-- State untuk input ketikan
  const [sortBy, setSortBy] = useState("created_at"); 
  const [sortOrder, setSortOrder] = useState("desc"); 
  // const debouncedSearchTerm = useDebounce(searchTerm, 300); // <-- Dihapus
  // --- Akhir State ---

  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
     try {
      setLoading(true);
      const res = await axiosClient.get("/orders");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data pesanan.";
      setError(message); setOrders([]); console.error("Error fetching orders:", err);
    } finally { setLoading(false); }
  };

  const fetchOrderDetail = async (orderId) => {
     setModalLoading(true); setUpdateStatus(null); setShipStatus({ type: "", message: "" });
    try {
      const res = await axiosClient.get(`/orders/${orderId}`);
      const data = res.data.order;
      setSelectedOrder(data); setShowDetailModal(true);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil detail pesanan.";
      alert(message); console.error("Error fetching order detail:", err);
    } finally { setModalLoading(false); }
  };

  const handleVerifyPayment = async () => {
     setModalLoading(true); setUpdateStatus(null);
    try {
      const paymentId = selectedOrder?.payment?.id;
      if (!paymentId) { setUpdateStatus({ type: "error", message: "ID Pembayaran tidak ditemukan." }); return; }
      await axiosClient.put(`/payments/${paymentId}/verify`);
      setUpdateStatus({ type: "success", message: "Pembayaran berhasil diverifikasi! Status order berubah menjadi 'diproses'." });
      await fetchOrders(); await fetchOrderDetail(selectedOrder.id);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memverifikasi pembayaran.";
      setUpdateStatus({ type: "error", message });
    } finally { setModalLoading(false); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
     setModalLoading(true); setUpdateStatus(null);
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { order_status: newStatus });
      setUpdateStatus({ type: "success", message: `Status berhasil diperbarui menjadi '${newStatus}'.` });
      await fetchOrders(); await fetchOrderDetail(orderId);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memperbarui status.";
      setUpdateStatus({ type: "error", message });
    } finally { setModalLoading(false); }
  };

  const handleShipOrder = async (orderId, formData) => {
     setModalLoading(true); setShipStatus({ type: "loading", message: "Menyimpan resi..." });
    try {
      const res = await axiosClient.put(`/orders/${orderId}/ship`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShipStatus({ type: "success", message: res.data.message });
      await fetchOrders();
      const updatedOrderRes = await axiosClient.get(`/orders/${orderId}`);
      setSelectedOrder(updatedOrderRes.data.order);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan resi.";
      setShipStatus({ type: "error", message: message });
    } finally { setModalLoading(false); }
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false); if (!selectedOrder) return;
    setModalLoading(true); setUpdateStatus(null);
    try {
      await axiosClient.put(`/orders/${selectedOrder.id}/status`, { order_status: "dibatalkan" });
      setUpdateStatus({ type: "success", message: "Pesanan berhasil dibatalkan." });
      await fetchOrders(); await fetchOrderDetail(selectedOrder.id);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal membatalkan pesanan.";
      setUpdateStatus({ type: "error", message });
    } finally { setModalLoading(false); }
  };

  const handleCancelClick = () => { setShowDetailModal(false); setShowCancelModal(true); };

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu pembayaran": case "menunggu verifikasi": return "bg-yellow-100 text-yellow-800";
      case "diproses": case "dikirim": case "diterima": case "selesai": case "verified": return "bg-green-100 text-green-800";
      case "dibatalkan": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // --- Logika Filter & Sort ---
   const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const searchLower = searchTerm.toLowerCase(); // <-- Menggunakan searchTerm
        const userName = `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.toLowerCase();
        // Cari berdasarkan ID Order, Nama Pembeli, Email, atau Status
        return (
          `#${order.id}`.includes(searchLower) ||
          userName.includes(searchLower) ||
          order.user?.email?.toLowerCase().includes(searchLower) ||
          order.order_status?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;

        if (sortBy === 'created_at' || sortBy === 'updated_at') {
          const dateA = new Date(aValue); const dateB = new Date(bValue);
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return sortOrder === "asc" ? -1 : 1;
          if (isNaN(dateB)) return sortOrder === "asc" ? 1 : -1;
          const result = dateA - dateB;
          return sortOrder === "asc" ? result : -result;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
           const result = aValue - bValue;
           return sortOrder === 'asc' ? result : -result;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          const result = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? result : -result;
        } else if (sortBy === 'user') { // Sort by user first name
            const nameA = a.user?.first_name || '';
            const nameB = b.user?.first_name || '';
            const result = nameA.localeCompare(nameB);
            return sortOrder === 'asc' ? result : -result;
        } else if (sortBy === 'user.email') { // Sort by user email
            const emailA = a.user?.email || '';
            const emailB = b.user?.email || '';
            const result = emailA.localeCompare(emailB);
            return sortOrder === 'asc' ? result : -result;
        }
        return 0;
      });
  }, [orders, searchTerm, sortBy, sortOrder]); // <-- Dependensi diubah
  // --- Akhir Logika Filter & Sort ---


  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
     const firstItemIndex = (currentPage - 1) * itemsPerPage;
     return filteredAndSortedOrders.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

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

   const handlePageChange = (page) => { 
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

  // --- Handler untuk Submit Form ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };
  // --------------------------------

  const orderTableColumns = [
    {
      key: "no", label: "No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: "id", label: "ID Order", sortable: true, render: (order) => `#${order.id}` },
    { key: "user", label: "Pembeli", sortable: true, render: (order) => `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim() || "N/A" },
    { key: "user.email", label: "Email", sortable: true, render: (order) => order.user?.email || "N/A" },
    { key: "created_at", label: "Tanggal Pesanan", sortable: true, render: (order) => formatDate(order.created_at || order.createdAt) },
    { key: "grand_total", label: "Grand Total", sortable: true, render: (order) => `Rp ${parseFloat(order.grand_total || 0).toLocaleString("id-ID")}` },
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
    <button onClick={() => fetchOrderDetail(order.id)} className="text-elegantburgundy hover:text-softpink transition-colors"> Detail </button>
  );


  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2"> Riwayat Transaksi </h1>
          <p className="text-darkgray/70"> Lihat dan kelola semua riwayat pesanan pelanggan. </p>
        </div>
        {error && <div className="bg-softpink/50 text-elegantburgundy p-4 rounded-lg mb-6"> {error} </div>}

        {/* --- Search Bar (Diubah menjadi Form) --- */}
         <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
             <form className="relative" onSubmit={handleSearchSubmit}>
               <input
                 type="text"
                 placeholder="Cari berdasarkan ID, Nama Pembeli, Email, atau Status..."
                 value={inputValue} // <-- Diubah ke inputValue
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
             loading={loading}
             renderActions={renderActions}
             onSort={handleSort} // Pass handler
             sortBy={sortBy}     // Pass state
             sortOrder={sortOrder} // Pass state
           />
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
      </main>
      
       <OrderDetailModal
        isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} order={selectedOrder}
        onVerifyPayment={handleVerifyPayment} onUpdateStatus={handleUpdateStatus} onCancelOrder={handleCancelClick}
        modalLoading={modalLoading} updateStatus={updateStatus} userRole={userRole}
        onShipOrder={handleShipOrder} shipStatus={shipStatus}
      />
      <ModalHapus
        isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={handleConfirmCancel}
        title="Batalkan Pesanan" message={`Apakah Anda yakin ingin membatalkan pesanan #${selectedOrder?.id}? Aksi ini tidak dapat dikembalikan.`}
      />
    </div>
  );
};

export default Receipt;