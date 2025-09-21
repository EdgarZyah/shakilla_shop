// client/src/components/OrderDetailModal.jsx
import React, { useState } from "react";

const OrderDetailModal = ({ isOpen, onClose, order, onVerifyPayment, onUpdateStatus, modalLoading, updateStatus }) => {
  if (!isOpen || !order) return null;

  const [newStatus, setNewStatus] = useState(order.Shipping?.shipping_status || order.order_status);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "menunggu pembayaran":
        return "bg-yellow-100 text-yellow-800";
      case "diproses":
      case "dikirim":
        return "bg-blue-100 text-blue-800";
      case "selesai":
      case "diterima":
      case "verified":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex justify-center items-center p-4 z-50">
      <div className="bg-purewhite p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-lightmauve">
          <h3 className="text-xl md:text-2xl font-bold text-darkgray">Detail Pesanan #{order.id}</h3>
          <button onClick={onClose} className="text-darkgray hover:text-elegantburgundy transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        {modalLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bagian Kiri: Ringkasan Pesanan & Pengiriman */}
            <div className="flex flex-col space-y-6">
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Informasi Umum</h4>
                <p className="text-darkgray font-medium">Pembeli:</p>
                <p className="text-darkgray">{order.User ? `${order.User.first_name} ${order.User.last_name}` : 'N/A'}</p>
                <p className="text-sm text-darkgray/70">{order.User?.email || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Ringkasan Pesanan</h4>
                <div className="flex justify-between font-medium text-darkgray mt-2">
                  <span>Tanggal Pesanan:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between font-medium text-darkgray mt-2">
                  <span>Total Harga:</span>
                  <span>Rp {order.total_price?.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Informasi Pengiriman</h4>
                {order.Shipping ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-darkgray font-medium">Alamat:</p>
                      <p className="text-darkgray">{order.Shipping.shipping_address}</p>
                    </div>
                    <div>
                      <p className="text-darkgray font-medium">Status Pengiriman:</p>
                      <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(order.Shipping.shipping_status)}`}>{order.Shipping.shipping_status}</span>
                    </div>
                    {order.Shipping.shipped_at && (
                      <p className="text-sm text-darkgray/70">Dikirim pada: {formatDate(order.Shipping.shipped_at)}</p>
                    )}
                    {order.Shipping.received_at && (
                      <p className="text-sm text-darkgray/70">Diterima pada: {formatDate(order.Shipping.received_at)}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-darkgray/70">Data pengiriman tidak tersedia.</p>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Item Pesanan</h4>
                <ul className="divide-y divide-lightmauve">
                  {order.OrderItems?.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-darkgray font-medium">{item.Product?.name || `ID: ${item.product_id}`}</p>
                        <p className="text-sm text-darkgray/70">Jumlah: {item.quantity}</p>
                      </div>
                      <p className="text-darkgray font-medium">Rp {item.price?.toLocaleString("id-ID")}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bagian Kanan: Bukti Pembayaran & Aksi Admin */}
            <div className="flex flex-col space-y-6">
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Bukti Pembayaran</h4>
                {order.Payment?.payment_proof_url ? (
                  <div className="flex flex-col">
                    <p className={`text-sm font-semibold ${getStatusBadge(order.Payment.payment_status)}`}>Status: {order.Payment.payment_status}</p>
                    {order.Payment.uploaded_at && (
                        <p className="text-sm text-darkgray/70 mb-2">Diunggah: {formatDate(order.Payment.uploaded_at)}</p>
                    )}
                    <a href={order.Payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-elegantburgundy hover:underline mb-2">
                      Lihat Bukti Pembayaran
                    </a>
                    <img src={order.Payment.payment_proof_url} alt="Bukti Pembayaran" className="max-w-full h-auto rounded-md shadow object-contain" />
                    {order.Payment.payment_status === 'pending' && onVerifyPayment && (
                        <button onClick={() => onVerifyPayment(order.id)} className="mt-4 w-full bg-elegantburgundy hover:bg-softpink text-purewhite py-2 rounded-md transition disabled:opacity-50">
                            Verifikasi Pembayaran
                        </button>
                    )}
                  </div>
                ) : (
                  <p className="text-darkgray/70">Belum ada bukti pembayaran.</p>
                )}
              </div>

              {onUpdateStatus && (
                <div>
                  <h4 className="font-bold text-lg text-darkgray mb-2 pb-2 border-b border-lightmauve">Ubah Status Pengiriman</h4>
                  {updateStatus && (
                    <div className={`p-3 rounded-lg text-sm mb-2 ${updateStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-softpink text-elegantburgundy"}`}>
                      {updateStatus.message}
                    </div>
                  )}
                  <form onSubmit={e => { e.preventDefault(); onUpdateStatus(order.id, newStatus); }} className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full sm:w-auto border border-lightmauve rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                    >
                      <option value="pending">Menunggu Diproses</option>
                      <option value="dikirim">Sedang Dikirim</option>
                      <option value="diterima">Telah Diterima</option>
                    </select>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full sm:w-auto bg-elegantburgundy text-purewhite py-2 px-4 rounded-md font-semibold hover:bg-softpink transition disabled:opacity-50"
                    >
                      {modalLoading ? "..." : "Simpan"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;