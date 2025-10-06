// src/pages/admin/manageProduct/addProduct.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal"; // Import komponen modal
import axiosClient from "../../../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const AddProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "", // <-- Menambahkan state stock
    thumbnail: null,
    images: [],
    category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  // Daftar MIME types yang diizinkan untuk validasi frontend
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // REFACTOR: Menggunakan axiosClient.get
      const res = await axiosClient.get("/categories");
      const data = res.data;
      
      setCategories(data);
    } catch (err) {
      console.error("Kesalahan jaringan saat mengambil kategori:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && !allowedTypes.includes(file.type)) {
      setModalMessage("Hanya file gambar (JPG, PNG, WEBP) yang diizinkan.");
      setIsModalOpen(true);
      e.target.value = null; // Reset input file
      return;
    }
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
        setModalMessage("Hanya file gambar (JPG, PNG, WEBP) yang diizinkan.");
        setIsModalOpen(true);
        e.target.value = null;
        return;
    }

    if (files.length > 4) {
      setModalMessage("Maksimal 4 gambar diperbolehkan.");
      setIsModalOpen(true);
      e.target.value = null;
      return;
    }
    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: null }));
  };

  const handleNewCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;

    try {
      // REFACTOR: Menggunakan axiosClient.post
      await axiosClient.post("/categories", { name: newCategoryName });

      alert("Kategori berhasil dibuat!");
      fetchCategories(); // Muat ulang daftar kategori
      setShowCategoryModal(false);
      setNewCategoryName("");
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal membuat kategori.";
      alert(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("stock", form.stock); // <-- Menambahkan stock ke formData
    formData.append("category_id", form.category_id);
    if (form.thumbnail) {
      formData.append("thumbnail", form.thumbnail);
    }
    form.images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      // REFACTOR: Menggunakan axiosClient.post untuk FormData
      await axiosClient.post("/products", formData, {
          headers: {
              'Content-Type': undefined // Biarkan Axios/browser menentukan multipart/form-data
          }
      });

      setStatus({ type: "success", message: "Produk berhasil ditambahkan!" });
      setForm({ name: "", price: "", description: "", stock: "", thumbnail: null, images: [], category_id: "" });
      setTimeout(() => {
        navigate("/admin/list-produk");
      }, 2000);
    } catch (err) {
      // REFACTOR: Error handling untuk Axios
      const message = err.response?.data?.message || "Gagal menambahkan produk.";
      setStatus({ type: "error", message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">Tambah Produk Baru</h1>
          <p className="text-darkgray/70">Isi formulir di bawah untuk menambahkan produk baru ke toko.</p>
        </div>

        {status && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === "success" ? "bg-softpink/50 text-darkgray" : "bg-softpink/50 text-elegantburgundy"}`} role="alert">
            {status.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-darkgray">Nama Produk</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleInputChange} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-darkgray">Harga</label>
              <input type="number" id="price" name="price" value={form.price} onChange={handleInputChange} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-darkgray">Stok</label>
              <input type="number" id="stock" name="stock" value={form.stock} onChange={handleInputChange} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-darkgray">Deskripsi</label>
              <textarea id="description" name="description" value={form.description} onChange={handleInputChange} rows="4" className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="category" className="block text-sm font-medium text-darkgray">Kategori</label>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="text-sm text-elegantburgundy hover:text-softpink font-medium">+ Kategori Baru</button>
              </div>
              <select id="category_id" name="category_id" value={form.category_id} onChange={handleInputChange} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required>
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Input Thumbnail Baru */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-darkgray">Gambar Thumbnail (Wajib)</label>
              <input type="file" id="thumbnail" name="thumbnail" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink" required />
              {form.thumbnail && (
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="relative">
                    <img src={URL.createObjectURL(form.thumbnail)} alt="Thumbnail Preview" className="h-32 w-32 object-cover rounded-md" />
                    <button type="button" onClick={handleRemoveThumbnail} className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Gambar Utama (Maks. 4) */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-darkgray">Gambar Produk Lainnya (Maks. 4)</label>
              <input type="file" id="images" name="images" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImagesChange} className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink" />
              <div className="mt-4 flex flex-wrap gap-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="h-32 w-32 object-cover rounded-md" />
                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-purewhite bg-elegantburgundy hover:bg-softpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elegantburgundy disabled:opacity-50">
              {loading ? "Menambahkan..." : "Tambah Produk"}
            </button>
          </form>
        </div>
      </main>

      {/* Modal untuk Kategori Baru */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-purewhite p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 text-darkgray">Buat Kategori Baru</h3>
            <form onSubmit={handleNewCategorySubmit}>
              <label htmlFor="newCategory" className="block text-sm font-medium text-darkgray">Nama Kategori</label>
              <input type="text" id="newCategory" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve">Batal</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WarningModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Warning!"
        message={modalMessage}
      />
    </div>
  );
};

export default AddProduct;