// client/src/pages/ProductPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../layouts/navbar";
import Footer from "../layouts/footer";
import Cookies from "js-cookie";
import axiosClient from "../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState(null);
  
  const [cartKey, setCartKey] = useState(0); // State untuk memicu render ulang Navbar

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // REFACTOR: Menggunakan axiosClient.get
        const res = await axiosClient.get(`/products/${id}`);
        const data = res.data;

        let imageUrls = [];
        if (data.image_url && typeof data.image_url === "string") {
          try {
            imageUrls = JSON.parse(data.image_url);
          } catch (e) {
            console.error("Gagal mengurai image_url JSON string:", e);
          }
        } else if (Array.isArray(data.image_url)) {
          imageUrls = data.image_url;
        }

        const allImages = data.thumbnail_url
          ? [data.thumbnail_url, ...imageUrls]
          : imageUrls;

        setProduct({ ...data, images: allImages });
        setLoading(false);
      } catch (err) {
        // REFACTOR: Error handling untuk Axios
        const message = err.response?.data?.message || "Gagal mengambil data produk.";
        setError(message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const userId = Cookies.get("userId");
    if (!userId) {
      setCartStatus({
        type: "error",
        message: "Anda harus login untuk menambahkan produk ke keranjang.",
      });
      return;
    }

    setCartStatus({ type: "loading", message: "Menambahkan ke keranjang..." });

    try {
      // REFACTOR: Menggunakan axiosClient.post. Axios otomatis handle body JSON.
      const res = await axiosClient.post("/carts", {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize, 
      });

      const data = res.data;

      setCartStatus({
        type: "success",
        message: data?.message || "Produk berhasil ditambahkan ke keranjang!",
      });
      
      // Memperbarui state `cartKey` setelah jeda 2 detik
      setTimeout(() => {
        setCartKey(prev => prev + 1);
        setCartStatus(null);
      }, 2000);
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Terjadi kesalahan jaringan.";
      setCartStatus({
        type: "error",
        message: message,
      });
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-elegantburgundy border-t-transparent"></div>
          <span className="text-lg font-medium text-darkgray">
            Memuat detail produk...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="text-center p-8 bg-purewhite rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-elegantburgundy mb-2">
            Error
          </h1>
          <p className="text-darkgray mb-4">{error}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-lg bg-elegantburgundy text-purewhite hover:bg-softpink transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="text-center p-8 bg-purewhite rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-darkgray mb-2">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-darkgray mb-4">
            Maaf, produk yang Anda cari tidak tersedia.
          </p>
          <Link
            to="/products"
            className="inline-block px-4 py-2 rounded-lg bg-elegantburgundy text-purewhite hover:bg-softpink transition"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar key={cartKey} />
      <div className="min-h-screen bg-lightmauve content-center">
        <div className="bg-purewhite rounded-2xl shadow-lg max-w-6xl mx-auto p-8 flex flex-col md:flex-row gap-10">
          {/* Left - Product Images */}
          <div className="md:w-1/2">
            <img
              src={product.images[selectedImageIndex]}
              alt={`${product.name} ${selectedImageIndex + 1}`}
              className="w-full h-[400px] object-cover rounded-xl shadow-md mb-4 transition"
            />
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${
                    idx === selectedImageIndex
                      ? "border-elegantburgundy ring-2 ring-elegantburgundy"
                      : "border-gray-200 hover:border-elegantburgundy"
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                />
              ))}
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3 text-darkgray">
                {product.name}
              </h1>
              <p className="text-elegantburgundy text-2xl font-semibold mb-6">
                Rp {product.price?.toLocaleString("id-ID")}
              </p>
              <p className="text-darkgray mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-darkgray">
                  Pilih Ukuran
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                        selectedSize === size
                          ? "bg-elegantburgundy text-purewhite border-elegantburgundy"
                          : "bg-purewhite hover:bg-lightmauve border-gray-200"
                      }`}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Input */}
              <div className="mb-6 flex items-center gap-4">
                <label
                  className="font-semibold text-darkgray"
                  htmlFor="quantity"
                >
                  Jumlah
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:outline-none"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>

              {/* Cart Status */}
              {cartStatus && (
                <div
                  className={`p-3 rounded-lg mb-4 text-sm ${
                    cartStatus.type === "success"
                      ? "bg-green-100 text-green-700"
                      : cartStatus.type === "loading"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cartStatus.message}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={cartStatus?.type === "loading"}
              className="w-full bg-elegantburgundy hover:bg-gray-700 text-purewhite py-3 rounded-xl font-semibold transition disabled:opacity-50 mt-6"
            >
              {cartStatus?.type === "loading"
                ? "Menambahkan..."
                : "Masukan Keranjang"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;