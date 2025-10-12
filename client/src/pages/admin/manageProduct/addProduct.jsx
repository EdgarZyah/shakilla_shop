import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal";
import CategoryModal from "../../../components/categoryModal"; // ✅ komponen baru
import axiosClient from "../../../api/axiosClient";

const AddProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    thumbnail: null,
    images: [],
    category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // ✅ ganti showCategoryModal
  const navigate = useNavigate();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get("/categories");
      const data = res.data.categories;
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
      e.target.value = null;
      return;
    }
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("category_id", form.category_id);
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
    form.images.forEach((image) => formData.append("images", image));

    try {
      await axiosClient.post("/products", formData);
      setStatus({ type: "success", message: "Produk berhasil ditambahkan!" });
      setForm({
        name: "",
        price: "",
        description: "",
        stock: "",
        thumbnail: null,
        images: [],
        category_id: "",
      });
      setTimeout(() => navigate("/admin/list-produk"), 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menambahkan produk.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">Tambah Produk Baru</h1>
          <p className="text-darkgray/70">
            Isi formulir di bawah untuk menambahkan produk baru ke toko.
          </p>
        </div>

        {status && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === "success"
                ? "bg-softpink/50 text-darkgray"
                : "bg-softpink/50 text-elegantburgundy"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-darkgray">Nama Produk</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-lightmauve rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray">Harga</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-lightmauve rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray">Stok</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-lightmauve rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="4"
                required
                className="mt-1 block w-full border border-lightmauve rounded-md p-2"
              />
            </div>

            {/* 🔽 Dropdown + Tombol Modal */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-darkgray">Kategori</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)} // ✅ buka modal
                  className="text-sm text-elegantburgundy hover:text-softpink font-medium"
                >
                  + Kategori Baru
                </button>
              </div>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-lightmauve rounded-md p-2"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-darkgray">
                Gambar Thumbnail (Wajib)
              </label>
              <input
                type="file"
                name="thumbnail"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                required
                className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
              />
              {form.thumbnail && (
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(form.thumbnail)}
                      alt="Thumbnail Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Gambar Lain */}
            <div>
              <label className="block text-sm font-medium text-darkgray">
                Gambar Produk Lainnya (Maks. 4)
              </label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagesChange}
                className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
              />
              <div className="mt-4 flex flex-wrap gap-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink disabled:opacity-50"
            >
              {loading ? "Menambahkan..." : "Tambah Produk"}
            </button>
          </form>
        </div>
      </main>

      {/* ✅ Gunakan CategoryModal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={fetchCategories} // refresh list setelah kategori ditambah
      />

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
