import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import ModalHapus from "../../components/modalHapus";
import Table from "../../components/table";
import Pagination from "../../components/pagination";

const ListCategory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        setStatus({ type: "error", message: data.message || "Gagal mengambil kategori." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan saat mengambil kategori." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    if (!categoryToDelete) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`http://localhost:3001/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Kategori berhasil dihapus!" });
        fetchCategories();
      } else {
        setStatus({ type: "error", message: data.message || "Gagal menghapus kategori." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
      setCategoryToDelete(null);
    }
  };

  // Logika Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentCategories = categories.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const categoryTableColumns = [
    { key: 'id', label: 'ID', render: (category) => `#${category.id}` },
    { key: 'name', label: 'Nama Kategori', render: (category) => category.name || '-' },
  ];

  const renderActions = (category) => (
    <div className="flex space-x-2">
      <button onClick={() => handleDeleteClick(category)} className="text-red-600 hover:text-red-900">
        Hapus
      </button>
    </div>
  );

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">Daftar Kategori</h1>
            <button
              onClick={() => { /* Tambahkan logika modal tambah kategori di sini */ }}
              className="bg-elegantburgundy text-purewhite py-2 px-4 rounded-lg shadow-md hover:bg-softpink transition-colors text-sm"
            >
              Tambah Kategori Baru
            </button>
          </div>
          <p className="text-darkgray/70">Kelola semua kategori produk di toko Anda.</p>
        </div>

        {status && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === "success" ? "bg-softpink/50 text-darkgray" : "bg-softpink/50 text-elegantburgundy"}`} role="alert">
            {status.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-x-auto">
          <Table
            columns={categoryTableColumns}
            data={currentCategories}
            loading={loading}
            onSort={() => {}}
            sortBy={null}
            sortOrder={null}
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
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default ListCategory;