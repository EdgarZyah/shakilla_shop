// client/src/pages/paymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../layouts/navbar';
import Footer from '../layouts/footer';
// --- PERBAIKAN 1: Pastikan path import benar ---
import QrisImage from '../assets/qris-merchant.jpg'; // Import gambar

// GANTI DENGAN NOMOR WA ADMIN
const ADMIN_WHATSAPP_NUMBER = "6289503609911";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Efek untuk mengambil data order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/orders/${orderId}`);
        const orderData = response.data.order;

        if (orderData.order_status !== 'menunggu pembayaran') {
          setError(`Pesanan ini sudah dalam status "${orderData.order_status}".`);
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Gagal mengambil data pesanan.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Handle pembatalan order
  const handleCancelOrder = async () => {
    if (!window.confirm("Yakin batalkan pesanan ini?")) return;
    setStatus({ type: 'loading', message: 'Membatalkan...' });
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { // Pastikan URL benar
        order_status: 'dibatalkan',
      });
      setStatus({ type: 'success', message: 'Pesanan dibatalkan.' });
      setTimeout(() => navigate('/user/orders'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Gagal.' });
    }
  };

  // Render konten utama
  const renderContent = () => {
    if (loading) { /* ... Loading spinner ... */ }
    if (error) { /* ... Pesan error ... */ }
    if (order) {
      const waMessage = encodeURIComponent(`Halo, Saya ingin mengkonfirmasi bahwa pembayaran order #${order.id}`);
      const waLink = `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP_NUMBER}&text=${waMessage}`;

      return (
        <div className="text-center">
          <p className="text-gray-700 mb-1">Metode Pembayaran</p>
          <h3 className="text-2xl font-bold text-darkgray mb-4">QRIS</h3>

          {/* QRIS & Nominal */}
          <div className="p-4 border border-dashed border-gray-400 rounded-lg">
            {/* --- PERBAIKAN 2: Gunakan variabel import --- */}
            <img
              src={QrisImage} // Gunakan variabel hasil import
              alt="QRIS Merchant Shakilla Shop"
              className="w-full h-full mx-auto rounded-md object-contain" // object-contain agar tidak terdistorsi
            />
            {/* --- AKHIR PERBAIKAN 2 --- */}
            <div className="text-center mt-3">
              <p className="text-sm text-gray-600">Total Nominal yang harus dibayarkan:</p>
              <p className="text-3xl font-bold text-elegantburgundy mt-1">
                Rp {parseFloat(order.grand_total).toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-gray-500 mt-1">Order ID: #{order.id}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">Scan QR code di atas.</p>

          {/* Tombol Aksi */}
          <div className="space-y-3 mt-6">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center bg-green-500 text-white py-3 px-4 rounded-md text-base font-semibold hover:bg-green-600 transition-colors">
              Hubungi Admin (WA)
            </a>
            <Link to="/user/orders" className="w-full flex justify-center items-center bg-elegantburgundy text-purewhite py-3 px-4 rounded-md text-base font-semibold shadow-md hover:bg-softpink transition-colors">
              Sudah Bayar? Upload Bukti
            </Link>
            <button onClick={handleCancelOrder} disabled={status.type === 'loading'} className="w-full text-sm text-red-600 hover:text-red-800 disabled:opacity-50">
              Batalkan Pesanan
            </button>
          </div>

          {/* Status Message */}
          {status.message && ( <div className={`mt-4 p-3 rounded-md text-sm font-medium ${ status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }`}>{status.message}</div> )}
        </div>
      );
    }
    return null; // Return null jika tidak loading, error, atau ada order
  };

  return (
    <>
      <Navbar />
      <div className="bg-lightmauve min-h-screen py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-purewhite rounded-xl shadow-lg p-6 md:p-8">
            <h1 className="text-3xl font-bold text-center mb-6 text-darkgray">
              Selesaikan Pembayaran
            </h1>
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;