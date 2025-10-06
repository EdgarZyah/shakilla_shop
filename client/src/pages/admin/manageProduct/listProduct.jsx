// src/pages/admin/manageProduct/listProduct.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { Link } from "react-router-dom";
import Table from "../../../components/table";
import ModalHapus from "../../../components/modalHapus";
import Pagination from "../../../components/pagination";
import axiosClient from "../../../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const ListProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch products dari backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // REFACTOR: Menggunakan axiosClient.get
      const response = await axiosClient.get("/products");
      const data = response.data;
      
      if (Array.isArray(data)) {
        const parsedProducts = data.map(product => {
          let imageUrls = [];
          if (product.image_url && typeof product.image_url === 'string') {
            try {
              imageUrls = JSON.parse(product.image_url);
            } catch (e) {
              console.error("Gagal mengurai image_url JSON string:", e);
            }
          } else if (Array.isArray(product.image_url)) {
            imageUrls = product.image_url;
          }
          return { ...product, image_url: imageUrls };
        });
        setProducts(parsedProducts);
      } else {
        setProducts([]);
        console.error("Data produk bukan array:", data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    if (!productToDelete) return;
    
    setLoading(true);
    setStatus(null);

    try {
      // REFACTOR: Menggunakan axiosClient.delete
      await axiosClient.delete(`/products/${productToDelete.id}`);

      setStatus({ type: "success", message: "Produk berhasil dihapus!" });
      fetchProducts(); // Refresh daftar produk
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal menghapus produk.";
      setStatus({ type: "error", message: message });
    } finally {
      setLoading(false);
      setProductToDelete(null); // Reset item yang akan dihapus
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ||
        product.Category?.name?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? result : -result;
      }
      
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      return 0;
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const uniqueCategories = [
    ...new Set(products.map((product) => product.Category?.name).filter(Boolean)),
  ];

  // Logika Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(firstItemIndex, lastItemIndex);
  
  const productTableColumns = [
    { key: 'id', label: 'ID', sortable: true, render: (product) => `#${product.id}` },
    { key: 'thumbnail_url', label: 'Gambar', sortable: false, render: (product) => product.thumbnail_url && <img src={product.thumbnail_url} alt={product.name} className="h-16 w-16 object-cover rounded-md" /> },
    { key: 'name', label: 'Nama Produk', sortable: true, render: (product) => product.name || '-' },
    { key: 'price', label: 'Harga', sortable: true, render: (product) => `Rp ${product.price?.toLocaleString("id-ID")}` || '-' },
    { key: 'Category.name', label: 'Kategori', sortable: true, render: (product) => product.Category?.name || '-' },
  ];
  
  const renderActions = (product) => (
    <div className="flex space-x-2">
      <Link
        to={`/admin/edit-produk/${product.id}`}
        className="text-elegantburgundy hover:text-softpink transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={() => handleDeleteClick(product)}
        className="text-softpink hover:text-elegantburgundy transition-colors"
      >
        Hapus
      </button>
    </div>
  );

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
            Daftar Produk
          </h1>
          <p className="text-darkgray/70">
            Kelola semua produk yang tersedia di toko
          </p>
        </div>

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-darkgray mb-2"
              >
                Cari Produk
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Cari berdasarkan nama produk..."
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
                  aria-label="Cari produk"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-darkgray/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="sm:w-48">
              <label
                htmlFor="categoryFilter"
                className="block text-sm font-medium text-darkgray mb-2"
              >
                Filter Kategori
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => {setCategoryFilter(e.target.value); setCurrentPage(1);}}
                className="w-full px-3 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
                aria-label="Filter kategori"
              >
                <option value="all">Semua Kategori</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-darkgray/70">
            Menampilkan {currentProducts.length} dari{" "}
            {filteredAndSortedProducts.length} produk
          </div>
        </div>

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-hidden">
          <Table
            columns={productTableColumns}
            data={currentProducts}
            loading={loading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            renderActions={renderActions}
          />
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <ModalHapus
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default ListProduct;