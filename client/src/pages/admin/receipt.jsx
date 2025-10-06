import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import ModalHapus from "../../components/modalHapus";
import Cookies from "js-cookie"; 
import axiosClient from "../../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const Receipt = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const userRole = Cookies.get("userRole"); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // REFACTOR: Menggunakan axiosClient.get
      const res = await axiosClient.get("/orders");
      const data = res.data;

      setOrders(data);
      setError(null);
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal mengambil data pesanan.";
      setError(message);
      setOrders([]);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      // REFACTOR: Menggunakan axiosClient.get
      const res = await axiosClient.get(`/orders/${orderId}`);
      const data = res.data;

      setSelectedOrder(data);
      setShowDetailModal(true);
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal mengambil detail pesanan.";
      alert(message);
      console.error("Error fetching order detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
        // REFACTOR: Menggunakan axiosClient.put. Axios otomatis handle body JSON.
        await axiosClient.put(`/orders/${orderId}/status`, { paymentStatus: 'verified' });

        setUpdateStatus({ type: "success", message: "Pembayaran berhasil diverifikasi! Status berubah menjadi 'diproses'." });
        await fetchOrders();
        await fetchOrderDetail(orderId);
    } catch (err) {
        // REFACTOR: Error handling untuk Axios
        const message = err.response?.data?.message || "Gagal memverifikasi pembayaran.";
        setUpdateStatus({ type: "error", message: message });
    } finally {
        setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      // REFACTOR: Menggunakan axiosClient.put
      await axiosClient.put(`/orders/${orderId}/status`, { newOrderStatus: newStatus });

      setUpdateStatus({ type: "success", message: `Status berhasil diperbarui menjadi '${newStatus}'!` });
      await fetchOrders();
      await fetchOrderDetail(orderId);
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal memperbarui status.";
      setUpdateStatus({ type: "error", message: message });
    } finally {
      setModalLoading(false);
    }
  };
  
  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    if (!selectedOrder) return;
    
    setModalLoading(true);
    setUpdateStatus(null);
    try {
        // REFACTOR: Menggunakan axiosClient.put
        await axiosClient.put(`/orders/${selectedOrder.id}/status`, { newOrderStatus: 'dibatalkan' });
        
        setUpdateStatus({ type: "success", message: "Pesanan berhasil dibatalkan." });
        await fetchOrders();
        await fetchOrderDetail(selectedOrder.id); 
    } catch (err) {
        // REFACTOR: Error handling untuk Axios
        const message = err.response?.data?.message || "Gagal membatalkan pesanan.";
        setUpdateStatus({ type: "error", message: message });
    } finally {
        setModalLoading(false);
    }
  };
  
  const handleCancelClick = () => {
    setShowDetailModal(false);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "menunggu pembayaran":
        return "bg-softpink/50 text-elegantburgundy";
      case "diproses":
      case "dikirim":
      case "diterima":
      case "selesai":
      case "verified":
        return "bg-elegantburgundy/50 text-purewhite";
      case "dibatalkan":
        return "bg-red-500 text-purewhite";
      default:
        return "bg-lightmauve text-darkgray";
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const orderTableColumns = [
    { key: 'id', label: 'No.', sortable: true, render: (order) => `#${order.id}` },
    { key: 'User.first_name', label: 'Pembeli', sortable: false, render: (order) => `${order.User.first_name} ${order.User.last_name}` || 'N/A' },
    { key: 'User.email', label: 'Email', sortable: false, render: (order) => order.User?.email || 'N/A' },
    { key: 'total_price', label: 'Total Harga', sortable: true, render: (order) => `Rp ${order.total_price?.toLocaleString("id-ID")}` },
    {
      key: 'order_status',
      label: 'Status Pesanan',
      sortable: false,
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.order_status)}`}>
          {order.order_status || "N/A"}
        </span>
      ),
    },
  ];

  const renderActions = (order) => (
    <button
      onClick={() => fetchOrderDetail(order.id)}
      className="text-elegantburgundy hover:text-softpink transition-colors"
    >
      Detail
    </button>
  );
  
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentOrders = orders.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
            Riwayat Transaksi
          </h1>
          <p className="text-darkgray/70">
            Lihat dan kelola semua riwayat pesanan pelanggan.
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
      </main>

      <OrderDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={selectedOrder}
        onVerifyPayment={handleVerifyPayment}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelClick}
        modalLoading={modalLoading}
        updateStatus={updateStatus}
        userRole={userRole}
      />
      
      <ModalHapus
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Batalkan Pesanan"
        message={`Apakah Anda yakin ingin membatalkan pesanan #${selectedOrder?.id}? Aksi ini tidak dapat dikembalikan.`}
      />
    </div>
  );
};

export default Receipt;