// client/src/components/whatsappRedirect.jsx
import React from 'react';

const WHATSAPP_NUMBER = "62895421996608";// Ganti dengan nomor WhatsApp Anda

const WhatsappRedirect = ({ order, user, cartItems }) => {
  const generateMessage = () => {
    // FIX 1: Akses properti total_price, pastikan ia diubah ke string '0' jika null/undefined
    const total = order?.total_price || 0; 
    const totalString = String(total); 
    
    // FIX 2: Mengkonversi total_price dari string (DECIMAL) menjadi angka yang aman
    const totalPriceValue = parseFloat(totalString);
    const finalPrice = isNaN(totalPriceValue) ? 0 : totalPriceValue;
    
    const dateString = order.created_at || new Date().toISOString();
    
    let message = `Halo Admin Shakilla Shop, saya ${user?.first_name} ${user?.last_name} ingin mengkonfirmasi pesanan saya. Berikut detail pesanan yang saya checkout:
    
*Nomor Pesanan:* #${order.order_id || 'N/A'}
*Tanggal Pesanan:* ${new Date(dateString).toLocaleDateString('id-ID')}
*Total Harga:* Rp ${finalPrice.toLocaleString('id-ID')}

*Detail Produk:*
`;

    (cartItems || []).forEach(item => {
      // Menggunakan item.product (huruf kecil)
      const productName = item.product?.name || 'Produk Tidak Ditemukan';
      const itemPrice = item.product?.price ? parseFloat(item.product.price) : 0;
      const qty = item.quantity || 1;

      message += `- ${productName} (Ukuran: ${item.size || 'N/A'}) - Qty: ${qty} x Rp ${itemPrice.toLocaleString('id-ID')}
`;
    });
    
    // Tambahkan alamat pengiriman dari data user
    message += `\n*Alamat Pengiriman:* ${user?.address || 'Belum tersedia'}`;

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