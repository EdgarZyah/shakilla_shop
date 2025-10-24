import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { Link } from "react-router-dom";
import Table from "../../../components/table";
import ModalHapus from "../../../components/modalHapus";
import Pagination from "../../../components/pagination";
import axiosClient from "../../../api/axiosClient";
import { getCleanedImageUrl } from "../../../utils/imageHelper"; // ✅ Helper untuk gambar

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
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState(""); // <-- PERUBAHAN 1: State untuk input
  const itemsPerPage = 10;

  // ================== Fetch Produk ==================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/products");
      const data = response.data.products || response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Format data produk tidak valid:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================== Hapus Produk ==================
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await axiosClient.delete(`/products/${productToDelete.id}`);
      setStatus({ type: "success", message: "Produk berhasil dihapus!" });
      fetchProducts();
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menghapus produk.";
      setStatus({ type: "error", message });
    } finally {
      setIsModalOpen(false);
      setProductToDelete(null);
    }
  };

  // ================== Filter & Sort ==================
  const getNestedValue = (obj, path) =>
    path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);

  const filteredAndSortedProducts = products
    .filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.name?.toLowerCase() || "";
      return (
        name.includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "all" ||
          category === categoryFilter.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
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

  const handlePageChange = (page) => setCurrentPage(page);

  // --- PERUBAHAN 2: Handler untuk form submit ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Mencegah halaman refresh
    setSearchTerm(inputValue); // Terapkan nilai input ke state filter
    setCurrentPage(1); // Reset halaman ke 1
  };
  // ---------------------------------------------

  // ================== Pagination ==================
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ================== Kategori Unik ==================
  const uniqueCategories = [
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  // ================== Kolom Tabel ==================
  const productTableColumns = [
    // --- PERUBAHAN 3: Kolom "NO" ditambahkan ---
    {
      key: "no",
      label: "NO",
      sortable: false,
      render: (row, rowIndex) => {
        return (currentPage - 1) * itemsPerPage + rowIndex + 1;
      },
    },
    // ------------------------------------------
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (product) => `#${product.id}`,
    },
    {
      key: "thumbnail_url",
      label: "Gambar",
      sortable: false,
      render: (product) => {
        const imageUrl = getCleanedImageUrl(product.thumbnail_url);
        return (
          <img
            src={imageUrl || "/no-image.png"}
            alt={product.name}
            className="h-16 w-16 object-cover rounded-md border border-gray-200 bg-gray-50"
            onError={(e) => (e.target.src = "/no-image.png")}
          />
        );
      },
    },
    {
      key: "name",
      label: "Nama Produk",
      sortable: true,
      render: (product) => product.name || "-",
    },
    {
      key: "price",
      label: "Harga",
      sortable: true,
      render: (product) =>
        product.price
          ? `Rp ${product.price.toLocaleString("id-ID")}`
          : "Rp 0",
    },
    {
      key: "category.name",
      label: "Kategori",
      sortable: true,
      render: (product) => product.category?.name || "-",
    },
  ];

  // ================== Aksi (Edit / Hapus) ==================
  const renderActions = (product) => (
    <div className="flex space-x-3">
      <Link
        to={`/admin/edit-produk/${product.id}`}
        className="text-elegantburgundy hover:text-softpink font-medium"
      >
        Edit
      </Link>
      <button
        onClick={() => handleDeleteClick(product)}
        className="text-softpink hover:text-elegantburgundy font-medium"
      >
        Hapus
      </button>
    </div>
  );

  // ================== Render ==================
  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      {/* Sidebar */}
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
            Daftar Produk
          </h1>
          <p className="text-darkgray/70">
            Kelola semua produk yang tersedia di toko Anda.
          </p>
        </div>

        {/* Filter dan Search */}
        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* --- PERUBAHAN 4: Modifikasi Search --- */}
            {/* Search */}
            <form className="flex-1" onSubmit={handleSearchSubmit}>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-darkgray mb-2"
              >
                Cari Produk
              </label>
              <input
                id="search"
                type="text"
                placeholder="Cari berdasarkan nama produk..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
              />
            </form>
            {/* ------------------------------------ */}


            {/* Filter Kategori */}
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
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
              >
                <option value="all">Semua Kategori</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Produk */}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Modal Konfirmasi Hapus */}
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