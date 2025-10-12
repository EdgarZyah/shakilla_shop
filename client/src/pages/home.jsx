import React, { useEffect, useState } from "react";
import Hero from "../components/hero.jsx";
import HeroCarousel from "../components/heroCarousel.jsx";
import Navbar from "../layouts/navbar.jsx";
import ProductDisplay from "../components/productDisplay.jsx";
import Footer from "../layouts/footer.jsx";
import DisplayLeft from "../components/displayLeft.jsx";
import DisplayRight from "../components/displayRight.jsx";
import Contact from "../components/contact.jsx";
import WhatsappOverlay from "../components/whatsappOverlay";
import axiosClient from "../api/axiosClient"; // <-- FIX: Import axiosClient

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            // FIX: Menggunakan axiosClient dan mengambil produk dari .data.products
            const res = await axiosClient.get("/products");
            const data = res.data.products; // FIX

            if (Array.isArray(data)) {
              setProducts(data);
            } else {
              setProducts([]);
              console.error("Data produk dari backend bukan array:", res.data);
            }
        } catch (err) {
            console.error("Gagal fetch produk:", err);
            setProducts([]);
        }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (productId) => {
    alert(`Tambah produk id ${productId} ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-lightmauve flex flex-col">
      <Navbar />
      <HeroCarousel />
      <DisplayLeft />
      <DisplayRight />
      <ProductDisplay products={products} onAddToCart={handleAddToCart} />
      <Hero />
      <Contact />
      <WhatsappOverlay />
      <Footer />
    </div>
  );
};

export default Home;