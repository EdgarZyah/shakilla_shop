// client/src/components/orderDetailModal.jsx
import React, { useState, useEffect } from "react";
import { getCleanedImageUrl } from "../utils/imageHelper"; // <-- Menggunakan helper resmi
import { FaPhone } from "react-icons/fa"; // <-- Impor ikon telepon

// === UTILITAS UMUM ===

const formatStatus = (status) => {
  if (!status) return "N/A";
  const lower = status.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const getStatusBadge = (status) => {
  const s = status?.toLowerCase() || "";
  switch (s) {
    case "pending":
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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    let d = new Date(dateString);
    if (isNaN(d.getTime())) d = new Date(dateString.replace(" ", "T"));
    if (isNaN(d.getTime())) return "N/A";

    return d.toLocaleString("id-ID", {
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

// === KOMPONEN UTAMA ===
const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onVerifyPayment,
  onUpdateStatus,
  onCancelOrder,
  modalLoading,
  updateStatus,
  userRole,
  onShipOrder,
  shipStatus,
}) => {
  if (!isOpen || !order) return null;

  const orderItems = order.items || [];
  const payment = order.payment;
  const user = order.user || order.User; // 'user' sekarang berisi phone_number
  const currentOrderStatus = order.order_status || "pending";

  const isCancelled = currentOrderStatus === "dibatalkan";
  const isAwaitingVerification = currentOrderStatus === "menunggu verifikasi";
  const isProcessed = currentOrderStatus === "diproses";
  const isOrderFinal = ["selesai", "dibatalkan"].includes(currentOrderStatus);

  const [newStatus, setNewStatus] = useState(currentOrderStatus);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    setNewStatus(currentOrderStatus);
  }, [currentOrderStatus]);

  const calculateItemSubtotal = (price, quantity) => {
    const p = parseFloat(price || 0);
    const q = parseInt(quantity || 0);
    return (p * q).toLocaleString("id-ID");
  };

  const getAvailableStatusOptions = () => {
    const options = [
      { value: currentOrderStatus, label: formatStatus(currentOrderStatus) },
    ];
    if (isOrderFinal || isCancelled) return options;
    const nextStatuses = [
      { value: "diproses", label: "Sedang Diproses" },
      { value: "dikirim", label: "Dalam Pengiriman" },
      { value: "diterima", label: "Pesanan Diterima" },
    ];
    nextStatuses.forEach((opt) => {
      if (opt.value !== currentOrderStatus) options.push(opt);
    });
    return options;
  };

  const availableStatusOptions = getAvailableStatusOptions();

  const handleShipSubmit = (e) => {
    e.preventDefault();
    if (onShipOrder) {
      const formData = new FormData();
      formData.append("shipping_receipt_number", receiptNumber);
      if (receiptFile) {
        formData.append("shipping_receipt_file", receiptFile);
      }
      onShipOrder(order.id, formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 border-b pb-2 border-lightmauve">
          <h3 className="text-2xl font-bold text-darkgray">
            Detail Pesanan #{order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-darkgray hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        {modalLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* === KIRI === */}
            <div className="flex flex-col space-y-6">
              {/* INFORMASI PEMBELI (DIPERBARUI) */}
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                  Informasi Pembeli
                </h4>
                <div className="space-y-2">
                  <p className="text-darkgray font-medium">
                    {user
                      ? `${user.first_name || ""} ${user.last_name || ""}`
                      : "N/A"}
                    <span className="text-sm text-darkgray/70 ml-2">
                      (@{user?.username || "N/A"})
                    </span>
                  </p>
                  <p className="text-sm text-darkgray/80">
                    {user?.email || "N/A"}
                  </p>
                  
                  {/* --- TAMBAHAN BARU --- */}
                  <p className="text-sm text-darkgray/80 flex items-center gap-2">
                    <FaPhone size={12} className="flex-shrink-0" />
                    {user?.phone_number || "No. Telepon belum diatur"}
                  </p>
                  {/* -------------------- */}
                </div>
              </div>

              {/* ITEM PESANAN (DIPERBARUI) */}
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                  Item Pesanan
                </h4>
                <ul className="divide-y divide-lightmauve max-h-40 overflow-y-auto pr-4">
                  {orderItems.map((item) => {
                    // Logika baru untuk mengambil data dari varian
                    const variant = item.productVariant;
                    const product = variant?.product;

                    return (
                      <li key={item.id} className="py-3 flex justify-between">
                        <div>
                          <p className="text-darkgray font-medium">
                            {product?.name ||
                              `Varian ID: ${item.product_variant_id} (Data Tidak Lengkap)`}
                          </p>
                          <p className="text-sm text-darkgray/70">
                            Jumlah: {item.quantity}
                            {variant?.color && (
                              <span className="ml-2">| Warna: {variant.color}</span>
                            )}
                            {variant?.size && (
                              <span className="ml-2">| Ukuran: {variant.size}</span>
                            )}
                          </p>
                        </div>
                        <p className="text-darkgray font-medium">
                          Rp {calculateItemSubtotal(item.price, item.quantity)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* RINGKASAN PESANAN */}
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                  Ringkasan Pesanan
                </h4>
                <div className="flex justify-between font-medium text-darkgray mt-2">
                  <span>Tanggal Pesanan:</span>
                  <span>{formatDate(order.created_at || order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm text-darkgray mt-1">
                  <span>Subtotal (Total Harga):</span>
                  <span>
                    Rp{" "}
                    {parseFloat(order.total_price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-darkgray mt-1">
                  <span>Biaya Ongkir:</span>
                  <span>
                    Rp{" "}
                    {parseFloat(order.shipping_cost || 0).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-darkgray mt-1 text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>
                    Rp{" "}
                    {parseFloat(order.grand_total || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* === KANAN === */}
            <div className="flex flex-col space-y-6">
              {/* INFO STATUS */}
              <div className="mt-2">
                <p className="text-darkgray font-medium">Status Pesanan:</p>
                <span
                  className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(
                    currentOrderStatus
                  )}`}
                >
                  {formatStatus(currentOrderStatus)}
                </span>
              </div>
              
              {/* INFO PENGIRIMAN */}
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                  Informasi Pengiriman
                </h4>
                <p className="text-darkgray">
                  {order.shipping_address || "Alamat belum tercatat"}
                </p>
                <p className="text-sm text-darkgray/70">
                  Metode: {order.shipping_method || "N/A"}
                </p>

                {order.shipping_receipt_number && (
                  <div className="mt-2 p-2 bg-lightmauve rounded-md">
                    <p className="text-sm font-medium text-darkgray">
                      No. Resi: {order.shipping_receipt_number}
                    </p>
                    {order.shipping_receipt_url && (
                      <a
                        href={getCleanedImageUrl(order.shipping_receipt_url)} // <-- MENGGUNAKAN HELPER RESMI
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-elegantburgundy hover:underline"
                      >
                        Lihat Foto Resi
                      </a>
                    )}
                  </div>
                )}
                {order.shipped_at && (
                  <p className="text-sm text-darkgray/70">
                    Dikirim: {formatDate(order.shipped_at)}
                  </p>
                )}
                {order.received_at && (
                  <p className="text-sm text-darkgray/70">
                    Diterima: {formatDate(order.received_at)}
                  </p>
                )}
              </div>

              {/* BUKTI PEMBAYARAN */}
              <div>
                <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                  Bukti Pembayaran
                </h4>
                {payment?.payment_proof_url ? (
                  <div className="flex flex-col">
                    <p
                      className={`text-sm font-semibold ${getStatusBadge(
                        payment.payment_status
                      )}`}
                    >
                      Status: {formatStatus(payment.payment_status)}
                    </p>
                    {payment.uploaded_at && (
                      <p className="text-sm text-darkgray/70 mb-2">
                        Diunggah: {formatDate(payment.uploaded_at)}
                      </p>
                    )}
                    <a
                      href={getCleanedImageUrl(payment.payment_proof_url)} // <-- MENGGUNAKAN HELPER RESMI
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-elegantburgundy hover:underline mb-2"
                    >
                      Lihat Bukti Pembayaran
                    </a>
                    {payment.payment_status === "pending" &&
                      onVerifyPayment &&
                      userRole === "admin" && (
                        <button
                          onClick={() => onVerifyPayment(order.id)}
                          className="mt-4 w-full bg-elegantburgundy hover:bg-softpink text-white py-2 rounded-md transition"
                          disabled={modalLoading}
                        >
                          Verifikasi Pembayaran
                        </button>
                      )}
                  </div>
                ) : (
                  <p className="text-darkgray/70">
                    Belum ada bukti pembayaran.
                  </p>
                )}
              </div>

              {/* FORM UPLOAD RESI (Admin) */}
              {userRole === "admin" &&
                isProcessed &&
                !isCancelled &&
                onShipOrder && (
                  <div>
                    <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                      Input Resi Pengiriman
                    </h4>
                    {shipStatus && (
                      <div
                        className={`p-3 rounded-lg text-sm mb-2 ${
                          shipStatus.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {shipStatus.message}
                      </div>
                    )}
                    <form onSubmit={handleShipSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-darkgray">
                          Nomor Resi
                        </label>
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          className="mt-1 block w-full border border-lightmauve rounded-md p-2 focus:ring-2 focus:ring-elegantburgundy"
                          required
                          disabled={modalLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-darkgray">
                          Foto Resi (Opsional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReceiptFile(e.target.files[0])}
                          className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink transition"
                          disabled={modalLoading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={modalLoading || !receiptNumber}
                        className="w-full bg-elegantburgundy text-white py-2 px-4 rounded-md font-semibold hover:bg-softpink transition disabled:opacity-50"
                      >
                        {modalLoading ? "Menyimpan..." : "Simpan Resi & Kirim"}
                      </button>
                    </form>
                  </div>
                )}

              {/* UBAH STATUS (Admin) */}
              {userRole === "admin" &&
                !isCancelled &&
                !isProcessed &&
                currentOrderStatus !== "selesai" && (
                  <div>
                    <h4 className="font-bold text-lg text-darkgray mb-2 border-b pb-2 border-lightmauve">
                      Ubah Status Pesanan
                    </h4>
                    {updateStatus && (
                      <div
                        className={`p-3 rounded-lg text-sm mb-2 ${
                          updateStatus.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {updateStatus.message}
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onUpdateStatus(order.id, newStatus);
                      }}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full sm:w-auto border border-lightmauve rounded-md p-2 focus:ring-2 focus:ring-elegantburgundy"
                        disabled={
                          modalLoading || isCancelled || isAwaitingVerification
                        }
                      >
                        {availableStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={
                          modalLoading ||
                          newStatus === currentOrderStatus ||
                          isAwaitingVerification
                        }
                        className="w-full sm:w-auto bg-elegantburgundy text-white py-2 px-4 rounded-md font-semibold hover:bg-softpink transition disabled:opacity-50"
                      >
                        {modalLoading ? "Menyimpan..." : "Simpan"}
                      </button>
                    </form>
                  </div>
                )}

              {/* BATALKAN PESANAN (Admin) */}
              {userRole === "admin" &&
                !isCancelled &&
                [
                  "pending",
                  "menunggu pembayaran",
                  "diproses",
                  "menunggu verifikasi",
                ].includes(currentOrderStatus) &&
                onCancelOrder && (
                  <button
                    onClick={onCancelOrder}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
                    disabled={modalLoading}
                  >
                    Batalkan Pesanan
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;