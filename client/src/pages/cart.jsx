// client/src/pages/cart.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/navbar';
import Footer from '../layouts/footer';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getCleanedImageUrl } from '../utils/imageHelper';

// --- Komponen untuk Item Keranjang ---
const CartItem = ({ item, onUpdateQuantity, onDeleteItem, status }) => {
  const imageUrl = getCleanedImageUrl(item.product?.thumbnail_url);
  const itemTotalPrice = (item.product?.price || 0) * (item.quantity || 0);

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-5">
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
        <img
          src={imageUrl}
          alt={item.product?.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {/* Bagian Atas: Nama & Harga */}
        <div className="flex justify-between font-medium text-darkgray">
          <h3 className="text-base sm:text-lg">
            {item.product?.name}
          </h3>
          <p className="ml-4 text-base sm:text-lg font-semibold">
            Rp {itemTotalPrice.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Bagian Tengah: Info Tambahan */}
        <div className="mt-1 flex text-sm">
          <p className="text-gray-500">
            Harga: Rp {item.product?.price?.toLocaleString("id-ID") || "0"}
          </p>
          <p className="ml-4 pl-4 border-l border-gray-300 text-gray-500">
            Ukuran: {item.size || "N/A"}
          </p>
        </div>

        {/* Bagian Bawah: Kuantitas & Hapus */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-darkgray">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || status?.type === "loading"}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-xl font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              -
            </button>
            <span className="px-3 text-base font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={status?.type === "loading"}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-xl font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <div className="flex">
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="font-medium text-elegantburgundy hover:text-softpink"
              disabled={status?.type === "loading"}
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Komponen Utama Halaman Keranjang ---
const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  // HAPUS state checkoutData, kita ganti dengan redirect
  // const [checkoutData, setCheckoutData] = useState(null); 
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("");

  const accessToken = sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

  // --- LOGIKA FETCH DATA ---
  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCartData();
    fetchUserData();
  }, [accessToken, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axiosClient.get(`/users/profile`);
      setUserData(response.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchCartData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/cart`);
      setCart(response.data);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data keranjang.";
      setError(message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA HANDLER ---
  const handleDeleteItem = async (itemId) => {
    // ... (Fungsi tidak berubah)
    setStatus({ type: 'loading', message: 'Menghapus item...' });
    try {
      await axiosClient.delete(`/cart/item/${itemId}`);
      setStatus({ type: 'success', message: 'Item berhasil dihapus.' });
      fetchCartData();
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus item.';
      setStatus({ type: 'error', message });
    } finally {
      setTimeout(() => setStatus(null), 2000);
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    // ... (Fungsi tidak berubah)
    if (newQuantity < 1) return;
    setStatus({ type: 'loading', message: 'Memperbarui kuantitas...' });
    try {
      await axiosClient.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      fetchCartData();
      setStatus(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memperbarui kuantitas.';
      setStatus({ type: 'error', message });
    }
  };

  const handleShippingChange = (e) => {
    // ... (Fungsi tidak berubah)
    const cost = parseInt(e.target.value, 10);
    setShippingCost(isNaN(cost) ? 0 : cost);
    if (isNaN(cost) || cost === 0) {
      setShippingMethod("");
    } else {
      const methodText = e.target.options[e.target.selectedIndex].text;
      const methodName = methodText.split(' (Rp')[0];
      setShippingMethod(methodName);
    }
  };

  const handleCheckout = async () => {
    setStatus({ type: 'loading', message: 'Memproses pesanan...' });
    const shippingAddress = userData?.address;

    if (!shippingAddress) {
      setStatus({ type: 'error', message: 'Alamat pengiriman di profil belum diisi.' });
      return;
    }
    if (shippingCost === 0 || shippingMethod === "") {
      setStatus({ type: 'error', message: 'Harap pilih lokasi pengiriman.' });
      return;
    }

    try {
      const response = await axiosClient.post('/orders/checkout', {
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
      });
      const data = response.data;
      const orderId = data.order.id;

      // --- PERUBAHAN UTAMA: REDIRECT ---
      // Hapus setCheckoutData(data.order);
      // Ganti dengan navigate ke halaman pembayaran baru
      navigate(`/payment/${orderId}`);
      // --- AKHIR PERUBAHAN ---

    } catch (err) {
      const message = err.response?.data?.message || 'Terjadi kesalahan saat checkout.';
      setStatus({ type: 'error', message });
    }
  };

  // --- KALKULASI & RENDER ---
  const calculateSubtotal = () => {
    // ... (Fungsi tidak berubah)
    return (
      cart?.items?.reduce((total, item) => {
        const price = parseFloat(item.product?.price || 0);
        const qty = parseInt(item.quantity || 0);
        return total + price * qty;
      }, 0) || 0
    );
  };

  if (loading) {
    // ... (Markup loading tidak berubah)
  }

  if (error) {
    // ... (Markup error tidak berubah)
  }

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + shippingCost;

  return (
    <>
      <Navbar />
      <div className="bg-lightmauve min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
          <h1 className="text-3xl font-bold text-center mb-8 text-darkgray">
            Keranjang Belanja
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* */}
            <div className="flex-1">
              <div className="bg-purewhite p-4 sm:p-6 rounded-xl shadow-lg">
                {!cart || cart.items?.length === 0 ? (
                  <div className="text-center py-12">
                    {/* ... (Markup keranjang kosong tidak berubah) ... */}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onDeleteItem={handleDeleteItem}
                        status={status}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* */}
            <div className="w-full lg:w-96">
              <div className="bg-purewhite rounded-xl shadow-lg p-6 lg:sticky lg:top-24">
                
                {/* --- Tampilan HANYA SEBELUM CHECKOUT --- */}
                {/* Hapus semua logic {checkoutData && (...)} */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-darkgray border-b border-gray-200 pb-3 mb-1">
                    Ringkasan
                  </h2>
                  
                  {/* Kalkulasi Harga */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-base text-gray-600">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    
                    <div className="pt-2">
                      <label htmlFor="shipping" className="block text-sm font-medium text-darkgray">
                        Lokasi Pengiriman
                      </label>
                      <select
                        id="shipping"
                        name="shipping"
                        onChange={handleShippingChange}
                        value={shippingCost}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elegantburgundy focus:ring-elegantburgundy sm:text-sm"
                        disabled={!cart || cart.items?.length === 0}
                      >
                        <option value="0">Pilih Lokasi...</option>
                        <option value="10000">Dalam kabupaten Cilacap (Rp 10.000)</option>
                        <option value="15000">Antar pulau Jawa (Rp 15.000)</option>
                        <option value="25000">Luar pulau Jawa (Rp 25.000)</option>
                        <option value="30000">Daerah khusus/terpencil (Rp 30.000)</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-between text-base text-gray-600">
                      <span>Ongkos Kirim</span>
                      <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* Total Harga */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-darkgray">
                      <span>Total Harga</span>
                      <span>
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Alamat Pengiriman */}
                  <div className="p-3 bg-lightmauve/50 rounded-md">
                    <h3 className="text-sm font-semibold text-darkgray">Alamat Kirim:</h3>
                    {userData?.address ? (
                      <p className="text-sm text-darkgray/80 mt-1">
                        {userData.address}
                      </p>
                    ) : (
                      <p className="text-sm text-elegantburgundy mt-1">
                        **Alamat belum diisi.**
                        <Link to="/user/profile" className="underline ml-1 font-medium">
                          Isi Alamat
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Status Message */}
                  {status && (
                    <div
                      className={`p-3 rounded-md text-sm font-medium ${
                        status.type === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  {/* Tombol Checkout */}
                  <button
                    onClick={handleCheckout}
                    disabled={
                      subtotal === 0 ||
                      status?.type === "loading" ||
                      !userData?.address ||
                      !cart?.items?.length ||
                      shippingCost === 0
                    }
                    className="w-full bg-elegantburgundy text-purewhite py-3 px-4 rounded-md text-base font-semibold shadow-md hover:bg-softpink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status?.type === "loading" ? "Memproses..." : "Lanjut ke Pembayaran"}
                  </button>
                </div>
                {/* --- AKHIR TAMPILAN --- */}

              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;