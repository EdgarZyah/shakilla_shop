// client/src/pages/cart.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/navbar';
import Footer from '../layouts/footer';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getCleanedImageUrl } from '../utils/imageHelper';

// KOMPONEN ITEM (Diperbarui untuk struktur ProductVariant)
const CartItem = ({ item, onUpdateQuantity, onDeleteItem, status }) => {
  // Akses data dari relasi yang dalam
  const variant = item.productVariant;
  const product = variant?.product;

  if (!variant || !product) return null; // Safety check

  const imageUrl = getCleanedImageUrl(product.thumbnail_url);
  const price = parseFloat(variant.price);
  const itemTotalPrice = price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-5 border-b border-lightmauve last:border-0">
      {/* Gambar */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {/* Info Utama */}
        <div className="flex justify-between font-medium text-darkgray">
          <h3 className="text-base sm:text-lg">{product.name}</h3>
          <p className="ml-4 text-base sm:text-lg font-semibold">
            Rp {itemTotalPrice.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Info Varian */}
        <div className="mt-1 flex flex-wrap text-sm text-gray-500 gap-x-4">
           <p>Harga Satuan: Rp {price.toLocaleString("id-ID")}</p>
           {variant.color && (
             <p className="pl-4 border-l border-gray-300">Warna: {variant.color}</p>
           )}
           {variant.size && (
             <p className="pl-4 border-l border-gray-300">Ukuran: {variant.size}</p>
           )}
        </div>

        {/* Kontrol Kuantitas */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-md">
                <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || status?.type === "loading"}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                >
                -
                </button>
                <span className="px-2 text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                // Cek stok varian
                disabled={status?.type === "loading" || item.quantity >= variant.stock}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                >
                +
                </button>
            </div>
            <span className="text-xs text-gray-400">Sisa stok: {variant.stock}</span>
          </div>

          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            className="text-sm font-medium text-red-600 hover:text-red-800"
            disabled={status?.type === "loading"}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("");

  const accessToken = sessionStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }
    fetchData();
  }, [accessToken, navigate]);

  const fetchData = async () => {
      setLoading(true);
      try {
          const [cartRes, userRes] = await Promise.all([
              axiosClient.get(`/cart`),
              axiosClient.get(`/users/profile`)
          ]);
          setCart(cartRes.data);
          setUserData(userRes.data.user);
          setError(null);
      } catch (err) {
          console.error(err);
          // Jangan set error global jika keranjang cuma kosong (backend mungkin return null)
          if(err.response?.status !== 404) {
              setError("Gagal memuat data.");
          }
      } finally {
          setLoading(false);
      }
  };
  
  // Wrapper fetch cart saja untuk update ringan
  const refreshCart = async () => {
      try {
          const res = await axiosClient.get(`/cart`);
          setCart(res.data);
      } catch(e) { console.error(e); }
  };

  const handleDeleteItem = async (itemId) => {
    setStatus({ type: 'loading', message: 'Menghapus...' });
    try {
      await axiosClient.delete(`/cart/item/${itemId}`);
      await refreshCart();
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', message: "Gagal menghapus item." });
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    // Optimistic update (opsional, tapi biar cepat di UI)
    // Disini kita panggil API langsung
    try {
      await axiosClient.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      await refreshCart();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal update stok.");
    }
  };

  const handleShippingChange = (e) => {
    const cost = parseInt(e.target.value, 10);
    setShippingCost(isNaN(cost) ? 0 : cost);
    if (isNaN(cost) || cost === 0) {
      setShippingMethod("");
    } else {
      const methodText = e.target.options[e.target.selectedIndex].text;
      setShippingMethod(methodText.split(' (Rp')[0]);
    }
  };

  const handleCheckout = async () => {
    setStatus({ type: 'loading', message: 'Memproses pesanan...' });
    
    if (!userData?.address) {
      setStatus({ type: 'error', message: 'Alamat pengiriman belum diisi di profil.' });
      return;
    }
    if (shippingCost === 0) {
      setStatus({ type: 'error', message: 'Pilih lokasi pengiriman.' });
      return;
    }

    try {
      const response = await axiosClient.post('/orders/checkout', {
        shipping_address: userData.address,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
      });
      navigate(`/payment/${response.data.order.id}`);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Checkout gagal.' });
    }
  };

  const calculateSubtotal = () => {
    return cart?.items?.reduce((total, item) => {
      const price = parseFloat(item.productVariant?.price || 0);
      return total + (price * item.quantity);
    }, 0) || 0;
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-lightmauve">Loading...</div>;

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + shippingCost;

  return (
    <>
      <Navbar />
      <div className="bg-lightmauve min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-darkgray mb-8 text-center">Keranjang Belanja</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LIST ITEM */}
            <div className="flex-1">
              <div className="bg-purewhite rounded-xl shadow-lg p-6 h-min">
                {!cart || cart.items?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <p className="text-xl text-gray-500 mb-4">Keranjang Anda kosong.</p>
                    <Link to="/products" className="bg-elegantburgundy text-purewhite px-6 py-2 rounded-lg hover:bg-softpink transition">
                      Mulai Belanja
                    </Link>
                  </div>
                ) : (
                  <div>
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

            {/* RINGKASAN */}
            <div className="w-full lg:w-96">
                <div className="bg-purewhite rounded-xl shadow-lg p-6 sticky top-24">
                    <h2 className="text-xl font-bold text-darkgray mb-4 border-b pb-2">Ringkasan</h2>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-darkgray mb-1">Pengiriman</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                value={shippingCost}
                                onChange={handleShippingChange}
                                disabled={!cart || cart.items.length === 0}
                            >
                                <option value="0">Pilih Lokasi...</option>
                                <option value="10000">Dalam Kabupaten (Rp 10.000)</option>
                                <option value="15000">Luar Kota (Rp 15.000)</option>
                                <option value="30000">Luar Pulau (Rp 30.000)</option>
                            </select>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ongkir</span>
                            <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-darkgray border-t pt-3">
                            <span>Total</span>
                            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    {/* Info Alamat */}
                    <div className="bg-lightmauve/30 p-3 rounded-md mb-4 text-sm">
                        <p className="font-semibold text-darkgray">Alamat Pengiriman:</p>
                        {userData?.address ? (
                            <p className="text-gray-600 mt-1">{userData.address}</p>
                        ) : (
                            <div className="mt-1 text-red-500">
                                Alamat belum diisi. <Link to="/user/edit-profile" className="underline font-bold">Edit Profil</Link>
                            </div>
                        )}
                    </div>

                    {status && (
                         <div className={`p-3 rounded-md mb-4 text-sm ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                             {status.message}
                         </div>
                    )}

                    <button
                        onClick={handleCheckout}
                        disabled={status?.type === 'loading' || !cart || cart.items.length === 0 || shippingCost === 0}
                        className="w-full bg-elegantburgundy text-purewhite py-3 rounded-lg font-bold hover:bg-softpink hover:text-elegantburgundy transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status?.type === 'loading' ? 'Memproses...' : 'Checkout'}
                    </button>
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