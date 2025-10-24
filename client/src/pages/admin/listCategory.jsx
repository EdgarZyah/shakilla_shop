// src/pages/admin/ListCategory.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import ModalHapus from "../../components/modalHapus";
import CategoryModal from "../../components/categoryModal";
import Table from "../../components/table";
import Pagination from "../../components/pagination";
import axiosClient from "../../api/axiosClient";
// import useDebounce from "../../hooks/useDebounce"; // <-- Dihapus

const ListCategory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- State untuk Search & Sort ---
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(""); // <-- Ditambahkan
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  // const debouncedSearchTerm = useDebounce(searchTerm, 300); // <-- Dihapus
  // --- Akhir State ---

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/categories");
      const data = res.data.categories;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mengambil kategori.";
      setStatus({ type: "error", message });
    } finally { setLoading(false); }
  };

  const handleDeleteClick = (category) => { setCategoryToDelete(category); setIsModalOpen(true); };

  const handleConfirmDelete = async () => {
     setIsModalOpen(false); if (!categoryToDelete) return;
    setLoading(true); setStatus(null);
    try {
      await axiosClient.delete(`/categories/${categoryToDelete.id}`);
      setStatus({ type: "success", message: "Kategori berhasil dihapus!" });
      fetchCategories(); // Refresh data
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menghapus kategori.";
      setStatus({ type: "error", message });
    } finally { setLoading(false); setCategoryToDelete(null); }
  };

  // --- Logika Filter & Sort ---
  const filteredAndSortedCategories = useMemo(() => {
    return categories
      .filter((category) => {
        const searchLower = searchTerm.toLowerCase(); // <-- Diubah ke searchTerm
        return category.name?.toLowerCase().includes(searchLower);
      })
      .sort((a, b) => {
        const aValue = a[sortBy]; 
        const bValue = b[sortBy];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
           const result = aValue - bValue;
           return sortOrder === 'asc' ? result : -result;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          const result = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? result : -result;
        }
        return 0;
      });
  }, [categories, searchTerm, sortBy, sortOrder]); // <-- Dependency diubah
  // --- Akhir Logika Filter & Sort ---


  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);
  const currentCategories = useMemo(() => {
     const firstItemIndex = (currentPage - 1) * itemsPerPage;
     return filteredAndSortedCategories.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredAndSortedCategories, currentPage, itemsPerPage]);

  const handlePageChange = (page) => { setCurrentPage(page); };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
     setCurrentPage(1);
  };
  
  // --- Handler untuk Submit Form ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };
  // --------------------------------

  const categoryTableColumns = [
    {
      key: "no", label: "NO",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: "id", label: "ID", sortable: true, render: (c) => `#${c.id}` },
    { key: "name", label: "Nama Kategori", sortable: true, render: (c) => c.name || "-" },
  ];

  const renderActions = (category) => (
    <div className="flex space-x-2">
      <button onClick={() => handleDeleteClick(category)} className="text-red-600 hover:text-red-900"> Hapus </button>
    </div>
  );

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2"> Daftar Kategori </h1>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-elegantburgundy text-purewhite py-2 px-4 rounded-lg shadow-md hover:bg-softpink transition-colors text-sm"> Tambah Kategori Baru </button>
          </div>
          <p className="text-darkgray/70"> Kelola semua kategori produk di toko Anda. </p>
        </div>
        {status && <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} role="alert"> {status.message} </div>}

         {/* --- Search Bar (Diubah menjadi Form) --- */}
         <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
             <form className="relative" onSubmit={handleSearchSubmit}>
               <input
                 type="text"
                 placeholder="Cari berdasarkan Nama Kategori..."
                 value={inputValue} // <-- Diubah ke inputValue
                 onChange={(e) => setInputValue(e.target.value)} // <-- Diubah
                 className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
               />
               <svg className="absolute left-3 top-2.5 w-5 h-5 text-darkgray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </form>
             <div className="mt-2 text-sm text-darkgray/70">
                 Menampilkan {currentCategories.length} dari {filteredAndSortedCategories.length} kategori
             </div>
          </div>
        {/* --- Akhir Search Bar --- */}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-x-auto">
          <Table
            columns={categoryTableColumns} data={currentCategories} loading={loading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            renderActions={renderActions}
          />
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
      </main>
       
       <ModalHapus isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} title="Hapus Kategori" message={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`} />
       <CategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCategoryAdded={fetchCategories} />
    </div>
  );
};

export default ListCategory;