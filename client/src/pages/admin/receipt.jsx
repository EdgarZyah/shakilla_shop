// client/src/pages/admin/receipt.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import ModalHapus from "../../components/modalHapus";
import axiosClient from "../../api/axiosClient";

// FIX: Fungsi format tanggal dari MySQL (YYYY-MM-DD HH:MM:SS)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const safeDateString = dateString.replace(" ", "T");
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  try {
    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("id-ID", options);
  } catch {
    return "N/A";
  }
};

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

  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Ambil semua orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/orders");
      const data = res.data; // controller mengirim array langsung
      setOrders(data);
      setError(null);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal mengambil data pesanan.";
      setError(message);
      setOrders([]);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ambil detail order (by ID)
  const fetchOrderDetail = async (orderId) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      const res = await axiosClient.get(`/orders/${orderId}`);
      const data = res.data.order; // controller kirim { order: {...} }
      setSelectedOrder(data);
      setShowDetailModal(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal mengambil detail pesanan.";
      alert(message);
      console.error("Error fetching order detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Verifikasi pembayaran
  const handleVerifyPayment = async () => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      const paymentId = selectedOrder?.payment?.id;
      if (!paymentId) {
        setUpdateStatus({
          type: "error",
          message: "ID Pembayaran tidak ditemukan.",
        });
        return;
      }
      await axiosClient.put(`/payments/${paymentId}/verify`);
      setUpdateStatus({
        type: "success",
        message:
          "Pembayaran berhasil diverifikasi! Status order berubah menjadi 'diproses'.",
      });
      await fetchOrders();
      await fetchOrderDetail(selectedOrder.id);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal memverifikasi pembayaran.";
      setUpdateStatus({ type: "error", message });
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Update status pesanan
  const handleUpdateStatus = async (orderId, newStatus) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      await axiosClient.put(`/orders/${orderId}/status`, {
        order_status: newStatus,
      });
      setUpdateStatus({
        type: "success",
        message: `Status berhasil diperbarui menjadi '${newStatus}'.`,
      });
      await fetchOrders();
      await fetchOrderDetail(orderId);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal memperbarui status.";
      setUpdateStatus({ type: "error", message });
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Batalkan pesanan
  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    if (!selectedOrder) return;
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      await axiosClient.put(`/orders/${selectedOrder.id}/status`, {
        order_status: "dibatalkan",
      });
      setUpdateStatus({
        type: "success",
        message: "Pesanan berhasil dibatalkan.",
      });
      await fetchOrders();
      await fetchOrderDetail(selectedOrder.id);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal membatalkan pesanan.";
      setUpdateStatus({ type: "error", message });
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
      case "menunggu pembayaran":
      case "menunggu verifikasi":
        return "bg-yellow-100 text-yellow-800";
      case "diproses":
      case "dikirim":
      case "diterima":
      case "selesai":
      case "verified":
        return "bg-green-100 text-green-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Kolom tabel sesuai model & relasi
  const orderTableColumns = [
    {
      key: "id",
      label: "No.",
      sortable: true,
      render: (order) => `#${order.id}`,
    },
    {
      key: "user",
      label: "Pembeli",
      render: (order) =>
        `${order.user?.first_name || ""} ${
          order.user?.last_name || ""
        }`.trim() || "N/A",
    },
    {
      key: "user.email",
      label: "Email",
      render: (order) => order.user?.email || "N/A",
    },
    {
      key: "createdAt",
      label: "Tanggal Pesanan",
      sortable: true,
      render: (order) => formatDate(order.created_at || order.createdAt),
    },

    {
      key: "total_price",
      label: "Total Harga",
      render: (order) =>
        `Rp ${parseFloat(order.total_price || 0).toLocaleString("id-ID")}`,
    },
    {
      key: "order_status",
      label: "Status Pesanan",
      render: (order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
            order.order_status
          )}`}
        >
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
  const currentOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ${
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
            renderActions={renderActions}
          />
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
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
