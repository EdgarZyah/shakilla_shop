// shakilla_shop/client/src/pages/admin/receipt.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import OrderDetailModal from "../../components/orderDetailModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";

const Receipt = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
        setError(null);
      } else {
        setError(data.message || "Gagal mengambil data pesanan.");
        setOrders([]);
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
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
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedOrder(data);
        setShowDetailModal(true);
      } else {
        alert(data.message || "Gagal mengambil detail pesanan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat mengambil detail.");
      console.error("Error fetching order detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
        const res = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ paymentStatus: 'verified' })
        });
        const data = await res.json();
        if (res.ok) {
            setUpdateStatus({ type: "success", message: "Pembayaran berhasil diverifikasi!" });
            await fetchOrders();
            await fetchOrderDetail(orderId);
        } else {
            setUpdateStatus({ type: "error", message: data.message || "Gagal memverifikasi pembayaran." });
        }
    } catch (err) {
        setUpdateStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
        setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setModalLoading(true);
    setUpdateStatus(null);
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ shippingStatus: newStatus }),
        headers: {
            "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateStatus({ type: "success", message: "Status berhasil diperbarui!" });
        await fetchOrders();
        await fetchOrderDetail(orderId);
      } else {
        setUpdateStatus({ type: "error", message: data.message || "Gagal memperbarui status." });
      }
    } catch (err) {
      setUpdateStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "menunggu pembayaran":
        return "bg-softpink/50 text-elegantburgundy";
      case "diproses":
      case "dikirim":
        return "bg-elegantburgundy/50 text-purewhite";
      case "selesai":
      case "diterima":
      case "verified":
        return "bg-elegantburgundy text-purewhite";
      default:
        return "bg-lightmauve text-darkgray";
    }
  };

  const getDisplayStatus = (order) => {
    if (order.Shipping) {
      return order.Shipping.shipping_status;
    }
    return order.order_status;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const orderTableColumns = [
    { key: 'id', label: 'ID Pesanan', sortable: true, render: (order) => `#${order.id}` },
    { key: 'User.first_name', label: 'Pembeli', sortable: false, render: (order) => `${order.User.first_name} ${order.User.last_name}` || 'N/A' },
    { key: 'User.email', label: 'Email', sortable: false, render: (order) => order.User?.email || 'N/A' },
    { key: 'total_price', label: 'Total Harga', sortable: true, render: (order) => `Rp ${order.total_price?.toLocaleString("id-ID")}` },
    {
      key: 'status',
      label: 'Status Pesanan',
      sortable: false,
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(getDisplayStatus(order))}`}>
          {getDisplayStatus(order) || "N/A"}
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
  
  // Logika Pagination
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
            onSort={() => {}} // Tidak ada sorting di sini
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
        modalLoading={modalLoading}
        updateStatus={updateStatus}
      />
    </div>
  );
};

export default Receipt;