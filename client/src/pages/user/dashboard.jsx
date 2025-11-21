import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/sidebar";
import { userMenu } from "../../layouts/layoutUser/userMenu";
import axiosClient from "../../api/axiosClient";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import OrderDetailModal from "../../components/orderDetailModal";

// --- HELPER FUNCTIONS ---
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

const getNestedValue = (obj, path) =>
  path.split(".").reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);

const DashboardUser = () => {
  // --- STATE UTAMA ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE PESANAN (Search, Filter, Sort, Pagination) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Upload
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const accessToken = sessionStorage.getItem("accessToken");
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }
    if (!userId) return;

    try {
      const [userRes, ordersRes] = await Promise.all([
        axiosClient.get(`/users/profile`),
        axiosClient.get(`/orders`, { params: { user_id: userId } }),
      ]);

      setUserData(userRes.data.user);
      const ordersData = ordersRes.data.orders;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data. Silakan coba login ulang.";
      setError(message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, userId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIKA UPLOAD BUKTI ---
  const handleUploadProof = async (e) => {
    e.preventDefault();
    const uploadUrl = `/payments/upload`;
    if (!paymentProofFile || !allowedTypes.includes(paymentProofFile.type)) {
      setUploadStatus({
        type: "error",
        message: "Hanya file gambar (JPEG, PNG, WEBP) yang diizinkan.",
      });
      return;
    }

    setUploadStatus({ type: "loading", message: "Mengunggah bukti pembayaran..." });
    const formData = new FormData();
    formData.append("order_id", selectedOrder.id);
    formData.append("payment_proof", paymentProofFile);

    try {
      await axiosClient.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus({
        type: "success",
        message: "Bukti berhasil diunggah. Menunggu verifikasi admin.",
      });
      setPaymentProofFile(null);
      
      setTimeout(async () => {
        await fetchData();
        setShowUploadModal(false);
        setUploadStatus(null);
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengunggah bukti.";
      setUploadStatus({ type: "error", message: message });
    }
  };

  // --- HELPER STATUS BADGE ---
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
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetail = async (order) => {
    try {
      const res = await axiosClient.get(`/orders/${order.id}`);
      const detailedOrder = res.data.order;
      setSelectedOrder({ ...detailedOrder, User: userData });
      setShowDetailModal(true);
    } catch (err) {
      alert("Gagal memuat detail pesanan.");
    }
  };

  // --- LOGIKA FILTER & SORT UTAMA ---
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (filterStatus && order.order_status !== filterStatus) {
            return false;
        }

        const searchLower = searchTerm.toLowerCase();
        return (
          `#${order.id}`.includes(searchLower) ||
          order.order_status?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;

        if (sortBy === "created_at" || sortBy === "updated_at") {
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          const result = dateA - dateB;
          return sortOrder === "asc" ? result : -result;
        } else if (typeof aValue === "number") {
          const result = aValue - bValue;
          return sortOrder === "asc" ? result : -result;
        } else {
          const result = String(aValue).localeCompare(String(bValue));
          return sortOrder === "asc" ? result : -result;
        }
      });
  }, [orders, searchTerm, filterStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  // Handlers
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

  // Columns
  const orderTableColumns = [
    {
      key: "no",
      label: "No",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: "id", label: "ID Pesanan", sortable: true, render: (order) => `#${order.id}` },
    {
      key: "created_at",
      label: "Tanggal",
      sortable: true,
      render: (order) => formatDate(order.created_at || order.createdAt),
    },
    {
      key: "grand_total",
      label: "Total",
      sortable: true,
      render: (order) => `Rp ${parseFloat(order.grand_total || 0).toLocaleString("id-ID")}`,
    },
    {
      key: "order_status",
      label: "Status",
      sortable: true,
      render: (order) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize whitespace-nowrap ${getStatusBadge(
            order.order_status
          )}`}
        >
          {order.order_status?.replace(/_/g, " ") || "N/A"}
        </span>
      ),
    },
  ];

  const renderActions = (order) => (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => handleViewDetail(order)}
        className="text-elegantburgundy hover:text-softpink transition-colors text-sm font-medium"
      >
        Detail
      </button>
      {(order.order_status === "pending" || order.order_status === "menunggu pembayaran") && (
        <>
          <Link
            to={`/payment/${order.id}`}
            className="text-green-600 hover:text-green-800 font-medium transition-colors text-sm"
          >
            Bayar
          </Link>
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowUploadModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
          >
            Upload Bukti Pembayaran
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-0 flex min-h-screen bg-lightmauve">
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
        <div className="w-full mx-auto">
          {error && (
            <div className="bg-softpink/50 text-elegantburgundy p-4 rounded-lg mb-6 border border-elegantburgundy/20">
              {error}
            </div>
          )}

          {/* --- BAGIAN 1: PROFIL USER --- */}
          {userData && (
            <div className="w-full bg-purewhite rounded-xl shadow-md p-6 md:p-8 mb-8 border border-lightmauve/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-darkgray">
                        Halo, {userData?.first_name}!
                    </h1>
                    <p className="text-gray-500 mt-1">Selamat datang kembali di dashboard Anda.</p>
                </div>
              </div>
            </div>
          )}

          {/* --- BAGIAN 2: TABEL PESANAN --- */}
          <div className="bg-purewhite rounded-xl shadow-md border border-lightmauve/50 overflow-hidden">
            <div className="p-6 border-b border-lightmauve/50">
                <h2 className="text-xl font-bold text-darkgray mb-4">Riwayat Pesanan</h2>
                
                {/* Wrapper untuk Search dan Filter (Responsif) */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                    {/* Search Bar */}
                    <form className="relative w-full md:flex-1" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Cari ID Pesanan..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors text-sm"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>

                    {/* Filter Status (Dropdown) */}
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1); // Reset halaman saat filter berubah
                        }}
                        className="w-full md:w-auto py-2 pl-3 pr-8 border border-lightmauve rounded-lg text-sm focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy bg-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                        <option value="menunggu verifikasi">Menunggu Verifikasi</option>
                        <option value="diproses">Diproses</option>
                        <option value="dikirim">Dikirim</option>
                        <option value="selesai">Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                    </select>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    Menampilkan {currentOrders.length} dari {filteredAndSortedOrders.length} pesanan
                </div>
            </div>

            {/* Container Tabel dengan Scroll Horizontal untuk Mobile */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px] md:min-w-full"> 
                  <Table
                    columns={orderTableColumns}
                    data={currentOrders}
                    loading={loading}
                    onSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    renderActions={renderActions}
                  />
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-lightmauve/50">
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            const tableElement = document.querySelector('table');
                            if(tableElement) tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                    />
                </div>
            )}
            
            {orders.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                    Belum ada riwayat pesanan.
                </div>
            )}
          </div>
        </div>

        {/* --- MODALS --- */}
        <OrderDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          order={selectedOrder}
          userRole="user"
        />

        {showUploadModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-purewhite p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
              <h3 className="text-xl font-bold mb-2 text-darkgray">
                Unggah Bukti Pembayaran
              </h3>
              <p className="text-sm text-gray-500 mb-6">Order ID: #{selectedOrder.id}</p>

              {uploadStatus && (
                <div
                  className={`p-3 rounded-lg mb-4 text-sm flex items-center ${
                    uploadStatus.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : uploadStatus.type === "loading" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                   {uploadStatus.message}
                </div>
              )}

              <form onSubmit={handleUploadProof}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Tagihan
                  </label>
                  <div className="text-lg font-bold text-elegantburgundy">
                    Rp {parseFloat(selectedOrder.grand_total || 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Bukti (Gambar)
                  </label>
                  <input
                    type="file"
                    accept={allowedTypes.join(",")}
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-lightmauve file:text-elegantburgundy
                      hover:file:bg-softpink transition cursor-pointer"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadStatus(null);
                      setPaymentProofFile(null);
                    }}
                    className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!paymentProofFile || uploadStatus?.type === "loading"}
                    className="py-2 px-6 rounded-lg text-sm font-medium text-white bg-elegantburgundy hover:bg-softpink hover:text-elegantburgundy transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadStatus?.type === "loading" ? "Mengunggah..." : "Unggah"}
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

export default DashboardUser;