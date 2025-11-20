import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import ModalHapus from "../../components/modalHapus";
import axiosClient from "../../api/axiosClient";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  // Pastikan format tanggal aman untuk Safari/Firefox (ganti spasi dengan T)
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

// Helper untuk sorting nested object (misal: user.email)
const getNestedValue = (obj, path) =>
  path
    .split(".")
    .reduce(
      (o, key) => (o && o[key] !== undefined ? o[key] : undefined),
      obj
    );

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

  // --- State Filter & Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  
  // [BARU] State untuk Filter Tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // --------------------------------

  const [isExporting, setIsExporting] = useState(false);
  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/orders");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : []);
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

  const fetchOrderDetail = async (orderId) => {
    setModalLoading(true);
    setUpdateStatus(null);
    setShipStatus({ type: "", message: "" });
    try {
      const res = await axiosClient.get(`/orders/${orderId}`);
      const data = res.data.order;
      setSelectedOrder(data);
      setShowDetailModal(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal mengambil detail pesanan.";
      alert(message);
    } finally {
      setModalLoading(false);
    }
  };

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

  const handleShipOrder = async (orderId, formData) => {
    setModalLoading(true);
    setShipStatus({ type: "loading", message: "Menyimpan resi..." });
    try {
      const res = await axiosClient.put(`/orders/${orderId}/ship`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShipStatus({ type: "success", message: res.data.message });
      await fetchOrders();
      const updatedOrderRes = await axiosClient.get(`/orders/${orderId}`);
      setSelectedOrder(updatedOrderRes.data.order);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan resi.";
      setShipStatus({ type: "error", message: message });
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

  // --- Export Excel (Menyertakan Filter Tanggal) ---
  const handleExportExcel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus) params.order_status = filterStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axiosClient.get("/orders/export/excel", {
        params: params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers["content-disposition"];
      let filename = "laporan_pesanan.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let errorMessage = "Gagal mengunduh file Excel.";
      if (err.response) {
        if (err.response.data instanceof Blob && err.response.data.type === "application/json") {
          try {
            const text = await err.response.data.text();
            errorMessage = JSON.parse(text).message || errorMessage;
          } catch (e) {}
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsExporting(false);
    }
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

  // --- [INTI PERBAIKAN] Logika Filter & Sort untuk Tabel ---
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // 1. Filter berdasarkan status dropdown
        if (filterStatus && order.order_status !== filterStatus) {
          return false;
        }

        // 2. [BARU] Filter berdasarkan Rentang Tanggal (Data Tabel)
        if (startDate || endDate) {
          const createdStr = order.created_at || order.createdAt;
          if (!createdStr) return false;
          
          // Konversi waktu pesanan ke Timestamp agar akurat
          const orderTime = new Date(createdStr.replace(" ", "T")).getTime();

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Mulai dari jam 00:00:00
            if (orderTime < start.getTime()) return false;
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Sampai jam 23:59:59
            if (orderTime > end.getTime()) return false;
          }
        }

        // 3. Filter berdasarkan kolom Search
        const searchLower = searchTerm.toLowerCase();
        if (!searchLower) return true;

        const userName = `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.toLowerCase();
        
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

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (sortBy === "created_at" || sortBy === "updated_at") {
          return sortOrder === "asc" 
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        } else if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          return sortOrder === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      });
  }, [orders, searchTerm, sortBy, sortOrder, filterStatus, startDate, endDate]); 
  // --- Akhir Logika Filter ---

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };

  const orderTableColumns = [
    {
      key: "no",
      label: "No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      key: "id",
      label: "ID Order",
      sortable: true,
      render: (order) => `#${order.id}`,
    },
    {
      key: "user",
      label: "Pembeli",
      sortable: true,
      render: (order) =>
        `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim() || "N/A",
    },
    {
      key: "user.email",
      label: "Email",
      sortable: true,
      render: (order) => order.user?.email || "N/A",
    },
    {
      key: "created_at",
      label: "Tanggal Pesanan",
      sortable: true,
      render: (order) => formatDate(order.created_at || order.createdAt),
    },
    {
      key: "grand_total",
      label: "Total",
      sortable: true,
      render: (order) =>
        `Rp ${parseFloat(order.grand_total || 0).toLocaleString("id-ID")}`,
    },
    {
      key: "order_status",
      label: "Status Pesanan",
      sortable: true,
      render: (order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadge(
            order.order_status
          )}`}
        >
          {order.order_status?.replace(/_/g, " ") || "N/A"}
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

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4 flex-wrap">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-2">
            <form className="relative flex-grow min-w-[200px]" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Cari berdasarkan ID, Nama, Email..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-darkgray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>
            {/* Filter Tanggal */}
            <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-col">
                 <span className="text-xs text-gray-500 ml-1 mb-0.5">Dari Tanggal</span>
                 <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors bg-purewhite text-sm"
                />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-gray-500 ml-1 mb-0.5">Sampai Tanggal</span>
                 <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors bg-purewhite text-sm"
                />
              </div>
            </div>

            {/* Filter Status & Export */}
            <div className="flex-col flex-shrink-0 flex gap-2 md:flex-row md:items-end">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 px-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors bg-purewhite"
              >
                <option value="">Semua Status</option>
                <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                <option value="menunggu verifikasi">Menunggu Verifikasi</option>
                <option value="diproses">Diproses</option>
                <option value="dikirim">Dikirim</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>

              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="h-10 flex items-center justify-center px-4 py-2 bg-green-600 text-purewhite rounded-lg font-semibold shadow-sm transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExporting ? "..." : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
          </div>

          <div className="mt-4 text-sm text-darkgray/70">
            Menampilkan {currentOrders.length} dari {filteredAndSortedOrders.length} pesanan
          </div>
        </div>

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-hidden">
          <Table
            columns={orderTableColumns}
            data={currentOrders}
            loading={loading}
            renderActions={renderActions}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
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
        onShipOrder={handleShipOrder}
        shipStatus={shipStatus}
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