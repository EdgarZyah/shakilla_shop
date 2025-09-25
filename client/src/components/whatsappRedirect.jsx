// client/src/components/WhatsappRedirect.jsx
import React from 'react';

const WHATSAPP_NUMBER = "6289503609911"; // Ganti dengan nomor WhatsApp Anda

const WhatsappRedirect = ({ order, user, cartItems }) => {
  const generateMessage = () => {
    let message = `Halo Admin Shakilla Shop, saya ${user?.first_name} ${user?.last_name} ingin mengkonfirmasi pesanan saya. Berikut detail pesanan yang saya checkout:
    
*Nomor Pesanan:* #${order.order_id}
*Tanggal Pesanan:* ${new Date(order.created_at).toLocaleDateString('id-ID')}
*Total Harga:* Rp ${order.total_price.toLocaleString('id-ID')}

*Detail Produk:*
`;

    cartItems.forEach(item => {
      message += `- ${item.Product?.name} (Ukuran: ${item.size || 'N/A'}) - Qty: ${item.quantity} x Rp ${item.Product?.price.toLocaleString('id-ID')}
`;
    });
    
    return message;
  };

  const handleRedirect = () => {
    if (!order || !user || !cartItems) {
      console.error("Data pesanan tidak lengkap.");
      return;
    }
    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleRedirect}
      className="w-full bg-green-500 text-white py-3 rounded-md font-semibold hover:bg-green-600 transition disabled:opacity-50"
      disabled={!order}
    >
      Konfirmasi Pesanan via WhatsApp
    </button>
  );
};

export default WhatsappRedirect;