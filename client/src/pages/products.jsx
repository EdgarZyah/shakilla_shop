import React, { useState, useEffect } from "react";
import Navbar from "../layouts/navbar.jsx";
import Footer from "../layouts/footer.jsx";
import Hero from "../components/hero.jsx";
import Card from "../components/card";
import Pagination from "../components/pagination";
import axiosClient from "../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const heroTitle = "Discover the Latest Fashion Trends";
const heroSubtitle = "[ Explore our curated collection of style & elegance ]";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Ambil produk dari backend
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            // REFACTOR: Menggunakan axiosClient.get
            const res = await axiosClient.get("/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            // Tetapkan produk kosong jika terjadi kesalahan
            setProducts([]);
        }
    };
    fetchProducts();
  }, []);

  // Ambil daftar kategori unik dari produk
  const categories = [
    "All Categories",
    ...new Set(products.map((p) => p.Category?.name).filter(Boolean)),
  ];

  // Filter produk berdasarkan search dan kategori
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.Category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Logika Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredProducts.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-lightmauve">
      <Navbar />
      {/* HERO SECTION */}
      <Hero title={heroTitle} subtitle={heroSubtitle} />

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search fashion items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 bg-purewhite border border-lightmauve rounded-md focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
          aria-label="Search fashion items"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 px-4 py-2 bg-purewhite border border-lightmauve rounded-md focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category || "Tanpa Kategori"}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-elegantburgundy mb-6">
          Fashion Collection
        </h2>
        {currentItems.length === 0 ? (
          <p className="text-center text-darkgray mt-10">
            Produk tidak ditemukan.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentItems.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <Footer />
    </div>
  );
};

export default Products;