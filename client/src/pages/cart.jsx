// client/src/pages/cart.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/navbar';
import Footer from '../layouts/footer';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import WhatsappRedirect from '../components/WhatsappRedirect';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // <-- REFACTOR: Import axiosClient

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  const userId = Cookies.get('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartData();
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      // REFACTOR: Menggunakan axiosClient.get
      const response = await axiosClient.get(`/users/${userId}`);
      setUserData(response.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchCartData = async () => {
    if (!userId) {
      setError("Anda harus login untuk melihat keranjang Anda.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // REFACTOR: Menggunakan axiosClient.get
      const response = await axiosClient.get(`/carts/user/${userId}`);
      const data = response.data;
      
      setCart(data);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil data keranjang.";
      setError(message);
      console.error("Error fetching cart:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setStatus({ type: 'loading', message: 'Menghapus item...' });
    try {
      // REFACTOR: Menggunakan axiosClient.delete
      await axiosClient.delete(`/carts/item/${itemId}`);
      
      setStatus({ type: 'success', message: 'Item berhasil dihapus dari keranjang.' });
      fetchCartData();
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus item.';
      setStatus({ type: 'error', message: message });
      console.error('Error deleting item:', err);
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setStatus({ type: 'loading', message: 'Memperbarui kuantitas...' });
    try {
        // REFACTOR: Menggunakan axiosClient.put. Axios otomatis handle body JSON.
        const response = await axiosClient.put(`/carts/item/${itemId}`, { quantity: newQuantity });
        const data = response.data;
        
        setStatus({ type: 'success', message: data.message || 'Kuantitas berhasil diperbarui.' });
        fetchCartData();
    } catch (err) {
        const message = err.response?.data?.message || 'Gagal memperbarui kuantitas.';
        setStatus({ type: 'error', message: message });
        console.error('Error updating quantity:', err);
    }
  };

  const handleCheckout = async () => {
      setStatus({ type: 'loading', message: 'Memproses pesanan...' });
      try {
          // REFACTOR: Menggunakan axiosClient.post
          const response = await axiosClient.post('/orders/checkout', {});

          const data = response.data;
          setStatus({ type: 'success', message: 'Checkout berhasil! Siapkan pesan WhatsApp...' });
          
          const newOrderData = {
              order_id: data.order_id,
              total_price: calculateSubtotal(),
              created_at: new Date().toISOString(),
          };
          setCheckoutData(newOrderData);

      } catch (err) {
          const message = err.response?.data?.message || 'Terjadi kesalahan jaringan.';
          setStatus({ type: 'error', message: message });
          console.error('Error during checkout:', err);
      }
  };

  const calculateSubtotal = () => {
    return cart?.CartItems?.reduce((total, item) => {
      return total + (item.Product?.price * item.quantity);
    }, 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat keranjang...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="text-center p-8 bg-purewhite rounded-lg shadow">
          <h1 className="text-2xl font-bold text-elegantburgundy mb-4">Error</h1>
          <p className="text-darkgray">{error}</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen bg-lightmauve">
        <h1 className="text-3xl font-bold text-center mb-8 text-darkgray">Keranjang Belanja</h1>
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Bagian Kiri: Daftar Item Keranjang */}
          <div className="md:w-3/4">
            <div className="bg-purewhite p-6 rounded-lg shadow-md">
              {cart?.CartItems?.length === 0 || !cart ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-darkgray/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-darkgray">
                    Keranjang Anda kosong
                  </h3>
                  <p className="mt-1 text-sm text-darkgray/70">
                    Mulai jelajahi produk kami dan tambahkan item ke keranjang Anda.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-lightmauve">
                  {cart.CartItems.map((item) => (
                    <div key={item.id} className="flex items-center py-4">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-lightmauve">
                        <img
                          src={item.Product?.thumbnail_url || 'https://via.placeholder.com/150'}
                          alt={item.Product?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-darkgray">
                            <h3>{item.Product?.name}</h3>
                            <p className="ml-4">
                              Rp {(item.Product?.price * item.quantity)?.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-darkgray/70">
                            Harga satuan: Rp {item.Product?.price?.toLocaleString('id-ID')}
                          </p>
                          <p className="mt-1 text-sm text-darkgray/70">
                            Ukuran: {item.size || 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center gap-2 text-darkgray/70">
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                                disabled={item.quantity <= 1 || status?.type === 'loading'}
                                className="w-6 h-6 flex items-center justify-center border border-lightmauve rounded-full text-lg font-bold hover:bg-lightmauve disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={status?.type === 'loading'}
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
                              disabled={status?.type === 'loading'}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Bagian Kanan: Ringkasan Harga dan Checkout */}
          <div className="md:w-1/4">
            <div className="bg-purewhite p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-darkgray">Ringkasan Keranjang</h2>
              <div className="flex justify-between text-lg font-semibold mb-2 text-darkgray">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-sm text-darkgray/70 mb-6">Biaya pengiriman dan pajak akan dihitung pada langkah selanjutnya.</p>
              
              {status && (
                <div className={`p-3 rounded-md mb-4 text-sm ${
                    status.type === 'success' ? 'bg-softpink/50 text-darkgray' : 'bg-softpink/50 text-elegantburgundy'
                }`}>
                    {status.message}
                </div>
              )}

              {/* Tampilkan tombol checkout atau tombol WhatsApp setelah checkout berhasil */}
              {checkoutData ? (
                <div className="space-y-2">
                    <WhatsappRedirect
                        order={checkoutData}
                        user={userData}
                        cartItems={cart.CartItems}
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
                  disabled={subtotal === 0 || status?.type === 'loading'}
                  className="w-full bg-elegantburgundy text-purewhite py-3 rounded-md font-semibold hover:bg-softpink transition disabled:opacity-50"
                >
                  {status?.type === 'loading' ? "Memproses..." : "Checkout"}
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