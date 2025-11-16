// client/src/pages/productPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../layouts/navbar";
import Footer from "../layouts/footer";
import axiosClient from "../api/axiosClient";
import WhatsappOverlay from "../components/whatsappOverlay";
import { getCleanedImageUrl } from "../utils/imageHelper";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State Pilihan User
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const [cartStatus, setCartStatus] = useState(null);
  const [cartKey, setCartKey] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/products/${id}`);
        const data = res.data.product;

        let imageUrls = [];
        if (data.image_url && typeof data.image_url === "string") {
          try { imageUrls = JSON.parse(data.image_url); } 
          catch (e) { console.error("Gagal parse image_url", e); }
        } else if (Array.isArray(data.image_url)) {
          imageUrls = data.image_url;
        }
        const thumbnailPath = data.thumbnail_url ? [data.thumbnail_url] : [];
        const allImages = [...thumbnailPath, ...imageUrls].map(path => getCleanedImageUrl(path));

        setProduct({ ...data, images: allImages });
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedImageIndex(0);
        setQuantity(1);

      } catch (err) {
        setError(err.response?.data?.message || "Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- LOGIKA VARIAN (Tidak Berubah) ---
  const { uniqueColors, uniqueSizes } = useMemo(() => {
    if (!product || !product.variants) return { uniqueColors: [], uniqueSizes: [] };
    const colors = new Set();
    const sizes = new Set();
    product.variants.forEach(v => {
      if (v.color) colors.add(v.color);
      if (v.size) sizes.add(v.size);
    });
    return {
      uniqueColors: Array.from(colors),
      uniqueSizes: Array.from(sizes)
    };
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product || !product.variants) return [];
    if (!selectedColor) return uniqueSizes;
    const sizesForColor = product.variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size);
    return Array.from(new Set(sizesForColor));
  }, [product, selectedColor, uniqueSizes]);

  const availableColors = useMemo(() => {
    if (!product || !product.variants) return [];
    if (!selectedSize) return uniqueColors;
    const colorsForSize = product.variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color);
    return Array.from(new Set(colorsForSize));
  }, [product, selectedSize, uniqueColors]);

  const selectedVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => {
      const matchColor = uniqueColors.length > 0 ? (v.color === selectedColor) : true;
      const matchSize = uniqueSizes.length > 0 ? (v.size === selectedSize) : true;
      return matchColor && matchSize;
    });
  }, [product, selectedColor, selectedSize, uniqueColors, uniqueSizes]);

  const displayPrice = selectedVariant 
    ? parseFloat(selectedVariant.price) 
    : product?.variants?.length > 0 
      ? Math.min(...product.variants.map(v => parseFloat(v.price)))
      : 0;
  
  const displayStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = selectedVariant && selectedVariant.stock <= 0;

  // --- HANDLERS (Tidak Berubah) ---
  const handleColorSelect = (color) => {
    if (color === selectedColor) {
      setSelectedColor(null);
    } else {
      setSelectedColor(color);
      const sizesForNewColor = product.variants
        .filter(v => v.color === color)
        .map(v => v.size);
      if (selectedSize && !sizesForNewColor.includes(selectedSize)) {
        setSelectedSize(null);
      }
    }
  };
  
  const handleSizeSelect = (size) => {
    if (size === selectedSize) {
      setSelectedSize(null);
    } else {
      setSelectedSize(size);
      const colorsForNewSize = product.variants
        .filter(v => v.size === size)
        .map(v => v.color);
      if (selectedColor && !colorsForNewSize.includes(selectedColor)) {
        setSelectedColor(null);
      }
    }
  };

  const handleAddToCart = async () => {
    const isLoggedIn = !!sessionStorage.getItem("accessToken");
    if (!isLoggedIn) {
      setCartStatus({ type: "error", message: "Anda harus login untuk berbelanja." });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
        setCartStatus({ type: "error", message: "Silakan pilih warna." });
        return;
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
        setCartStatus({ type: "error", message: "Silakan pilih ukuran." });
        return;
    }
    if (!selectedVariant) {
        setCartStatus({ type: "error", message: "Kombinasi varian tidak tersedia." });
        return;
    }
    if (quantity > selectedVariant.stock) {
        setCartStatus({ type: "error", message: "Stok tidak mencukupi." });
        return;
    }
    setCartStatus({ type: "loading", message: "Menambahkan ke keranjang..." });
    try {
      await axiosClient.post("/cart", {
        product_variant_id: selectedVariant.id,
        quantity: quantity,
      });
      setCartStatus({ type: "success", message: "Berhasil masuk keranjang!" });
      setTimeout(() => {
        setCartKey(prev => prev + 1);
        setCartStatus(null);
      }, 1500);
    } catch (err) {
      setCartStatus({ type: "error", message: err.response?.data?.message || "Gagal menambahkan." });
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-lightmauve">Memuat...</div>;
  if (error || !product) return <div className="min-h-screen flex justify-center items-center bg-lightmauve text-red-600">{error || "Produk tidak ditemukan"}</div>;

  const selectionRequired = uniqueColors.length > 0 || uniqueSizes.length > 0;
  const isSelectionComplete = selectedVariant != null;

  return (
    <>
      <Navbar key={cartKey} />
      <div className="min-h-screen bg-lightmauve py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-purewhite rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* GALERI FOTO */}
            <div className="md:w-1/2">
              <div className="aspect-square w-full overflow-hidden rounded-xl border border-lightmauve mb-4 relative group">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setIsZoomed(true)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImageIndex === idx ? "border-elegantburgundy" : "border-transparent hover:border-lightmauve"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* DETAIL PRODUK */}
            {/* --- PERUBAHAN DI SINI: flex flex-col --- */}
            <div className="md:w-1/2 flex flex-col">

              {/* --- PERUBAHAN DI SINI: Pembungkus 1 (flex-1) --- */}
              {/* Div ini akan tumbuh dan mendorong div tombol ke bawah */}
              <div className="flex-1">
                <span className="text-sm text-elegantburgundy font-semibold bg-softpink w-fit px-3 py-1 rounded-full mb-3">
                  {product.category?.name || "Kategori"}
                </span>
                <h1 className="text-3xl font-bold text-darkgray mb-2">{product.name}</h1>
                <p className="text-2xl font-bold text-elegantburgundy mb-4">
                  {selectedVariant 
                    ? `Rp ${displayPrice.toLocaleString("id-ID")}`
                    : `Rp ${displayPrice.toLocaleString("id-ID")}`
                  }
                </p>
                <p className="text-darkgray/80 mb-6 whitespace-pre-wrap text-sm leading-relaxed">
                  {product.description}
                </p>

                {/* --- RENDER VARIAN --- */}
                {uniqueColors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-darkgray mb-2">Warna: {selectedColor || ""}</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map(color => {
                        const isDisabled = selectedSize && !availableColors.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            disabled={isDisabled}
                            className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                              selectedColor === color
                                ? "bg-elegantburgundy text-purewhite border-elegantburgundy"
                                : "bg-white text-darkgray border-gray-300 hover:border-elegantburgundy"
                            } ${isDisabled ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {uniqueSizes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-darkgray mb-2">Ukuran: {selectedSize || ""}</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map(size => {
                        const isDisabled = selectedColor && !availableSizes.includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            disabled={isDisabled}
                            className={`w-10 h-10 flex items-center justify-center text-sm border rounded-lg transition-all ${
                              selectedSize === size
                                ? "bg-elegantburgundy text-purewhite border-elegantburgundy"
                                : "bg-white text-darkgray border-gray-300 hover:border-elegantburgundy"
                            } ${isDisabled ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STOK & QUANTITY */}
                <div className="flex items-center gap-6 mb-6 pt-4 border-t border-lightmauve">
                   <div className="flex items-center border border-gray-300 rounded-lg">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-darkgray hover:bg-gray-100 disabled:opacity-50"
                        disabled={!isSelectionComplete || isOutOfStock}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-12 text-center border-none focus:ring-0 p-0 text-darkgray"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={!isSelectionComplete || isOutOfStock}
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
                        className="px-3 py-2 text-darkgray hover:bg-gray-100 disabled:opacity-50"
                        disabled={!isSelectionComplete || isOutOfStock || quantity >= displayStock}
                      >
                        +
                      </button>
                   </div>
                   <div className="text-sm text-darkgray">
                      Stok: <span className="font-bold">{isSelectionComplete ? displayStock : "-"}</span>
                   </div>
                </div>

                {cartStatus && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                      cartStatus.type === "success" ? "bg-green-100 text-green-700" :
                      cartStatus.type === "loading" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                  }`}>
                    {cartStatus.message}
                  </div>
                )}
              </div>
              {/* --- AKHIR DARI DIV flex-1 --- */}


              {/* --- PERUBAHAN DI SINI: Pembungkus 2 (Button Wrapper) --- */}
              {/* Div ini sekarang didorong ke bawah oleh div flex-1 di atasnya */}
              <div className="mt-6 pt-6 border-t border-lightmauve">
                <button
                  onClick={handleAddToCart}
                  disabled={cartStatus?.type === "loading" || (selectionRequired && !isSelectionComplete) || isOutOfStock}
                  className="w-full py-3 rounded-xl bg-elegantburgundy text-purewhite font-bold text-lg shadow-lg hover:bg-softpink hover:text-elegantburgundy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartStatus?.type === "loading" ? "Memproses..." 
                    : isOutOfStock ? "Stok Habis"
                    : (selectionRequired && !isSelectionComplete) ? "Pilih Varian Dahulu"
                    : "Tambah ke Keranjang"}
                </button>
              </div>
              {/* --- AKHIR DARI DIV PEMBUNGKUS TOMBOL --- */}

            </div>
            {/* --- AKHIR DARI DIV flex-col --- */}
          </div>
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center p-4" onClick={() => setIsZoomed(false)}>
          <img src={product.images[selectedImageIndex]} alt="Zoom" className="max-h-full max-w-full object-contain" />
          <button className="absolute top-4 right-4 text-white text-4xl">&times;</button>
        </div>
      )}
      <WhatsappOverlay />
      <Footer />
    </>
  );
};

export default ProductPage;