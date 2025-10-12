// client/src/pages/cart.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/navbar';
import Footer from '../layouts/footer';
import { useNavigate, Link } from 'react-router-dom';
import WhatsappRedirect from '../components/WhatsappRedirect';
import axiosClient from '../api/axiosClient';
import { getCleanedImageUrl } from '../utils/imageHelper'; // ✅ gunakan helper path

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  const accessToken = sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

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

  const handleDeleteItem = async (itemId) => {
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

  const handleCheckout = async () => {
    setStatus({ type: 'loading', message: 'Memproses pesanan...' });
    const shippingAddress = userData?.address;

    if (!shippingAddress) {
      setStatus({
        type: 'error',
        message: 'Alamat pengiriman di profil belum diisi. Harap perbarui profil Anda.',
      });
      return;
    }

    try {
      const response = await axiosClient.post('/orders/checkout', {
        shipping_address: shippingAddress,
      });
      const data = response.data;
      setStatus({ type: 'success', message: 'Checkout berhasil! Menyiapkan pesan WhatsApp...' });
      setCheckoutData({
        order_id: data.order.id,
        total_price: data.order.total_price,
        created_at: data.order.created_at,
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Terjadi kesalahan jaringan saat checkout.';
      setStatus({ type: 'error', message });
    }
  };

  const calculateSubtotal = () => {
    return (
      cart?.items?.reduce((total, item) => {
        const price = parseFloat(item.product?.price || 0);
        const qty = parseInt(item.quantity || 0);
        return total + price * qty;
      }, 0) || 0
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="text-center p-8 bg-purewhite rounded-lg shadow">
          <h1 className="text-2xl font-bold text-elegantburgundy mb-4">Error</h1>
          <p className="text-darkgray">{error}</p>
          <Link
            to="/products"
            className="text-elegantburgundy hover:underline mt-4 inline-block"
          >
            Kembali Belanja
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen bg-lightmauve">
        <h1 className="text-3xl font-bold text-center mb-8 text-darkgray">
          Keranjang Belanja
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* === Daftar Item === */}
          <div className="md:w-3/4">
            <div className="bg-purewhite p-6 rounded-lg shadow-md">
              {!cart || cart.items?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="mt-4 text-lg font-medium text-darkgray">
                    Keranjang Anda kosong
                  </h3>
                  <Link to="/products" className="text-elegantburgundy hover:underline">
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-lightmauve">
                  {cart.items.map((item) => {
                    const imageUrl = getCleanedImageUrl(item.product?.thumbnail_url);
                    return (
                      <div key={item.id} className="flex items-center py-4">
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-lightmauve">
                          <img
                            src={imageUrl}
                            alt={item.product?.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-darkgray">
                              <h3>{item.product?.name}</h3>
                              <p className="ml-4">
                                Rp{" "}
                                {(
                                  (item.product?.price || 0) * (item.quantity || 0)
                                ).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-darkgray/70">
                              Harga satuan: Rp{" "}
                              {item.product?.price?.toLocaleString("id-ID") || "0"}
                            </p>
                            <p className="mt-1 text-sm text-darkgray/70">
                              Ukuran: {item.size || "N/A"}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center gap-2 text-darkgray/70">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || status?.type === "loading"}
                                className="w-6 h-6 flex items-center justify-center border border-lightmauve rounded-full text-lg font-bold hover:bg-lightmauve disabled:opacity-50"
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={status?.type === "loading"}
                                className="w-6 h-6 flex items-center justify-center border border-lightmauve rounded-full text-lg font-bold hover:bg-lightmauve disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
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
                  })}
                </div>
              )}
            </div>
          </div>

          {/* === Ringkasan Keranjang === */}
          <div className="md:w-1/4">
            <div className="bg-purewhite p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-darkgray">
                Ringkasan Keranjang
              </h2>
              <div className="flex justify-between text-lg font-semibold mb-2 text-darkgray">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>

              {userData?.address ? (
                <p className="text-sm text-darkgray/70 mb-2">
                  Alamat Kirim: {userData.address}
                </p>
              ) : (
                <p className="text-sm text-elegantburgundy mb-2">
                  **Alamat belum diisi di profil.**
                </p>
              )}

              <p className="text-sm text-darkgray/70 mb-6">
                Biaya pengiriman akan diinformasikan via WhatsApp.
              </p>

              {status && (
                <div
                  className={`p-3 rounded-md mb-4 text-sm ${
                    status.type === "success"
                      ? "bg-softpink/40 text-darkgray"
                      : "bg-softpink/40 text-elegantburgundy"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {checkoutData ? (
                <div className="space-y-2">
                  <WhatsappRedirect
                    order={checkoutData}
                    user={userData}
                    cartItems={cart.items}
                  />
                  <Link
                    to="/user/orders"
                    className="w-full flex justify-center bg-gray-200 text-darkgray py-3 rounded-md font-semibold hover:bg-gray-300 transition"
                  >
                    Lihat Pesanan Saya
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={
                    subtotal === 0 ||
                    status?.type === "loading" ||
                    !userData?.address ||
                    !cart?.items?.length
                  }
                  className="w-full bg-elegantburgundy text-purewhite py-3 rounded-md font-semibold hover:bg-softpink transition disabled:opacity-50"
                >
                  {status?.type === "loading" ? "Memproses..." : "Checkout"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
