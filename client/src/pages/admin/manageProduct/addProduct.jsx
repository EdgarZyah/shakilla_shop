import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal";
import CategoryModal from "../../../components/categoryModal";
import axiosClient from "../../../api/axiosClient";

const AddProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Form Induk
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    thumbnail: null,
    images: [],
  });
  
  // --- STATE BARU: Daftar Varian ---
  // Format: [{ color: "Merah", size: "L", price: 100000, stock: 10 }]
  const [variants, setVariants] = useState([
    { color: "", size: "", price: "", stock: "" }
  ]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const navigate = useNavigate();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get("/categories");
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Kesalahan jaringan saat mengambil kategori:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLER VARIAN ---
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariantRow = () => {
    setVariants([...variants, { color: "", size: "", price: "", stock: "" }]);
  };

  const removeVariantRow = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    } else {
      // Jika tinggal 1, reset isinya saja
      setVariants([{ color: "", size: "", price: "", stock: "" }]);
    }
  };
  // ----------------------

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

    // Validasi Varian Minimal
    const validVariants = variants.filter(v => v.price && v.stock !== "");
    if (validVariants.length === 0) {
        setModalMessage("Mohon isi minimal satu varian lengkap dengan harga dan stok.");
        setIsModalOpen(true);
        setLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category_id", form.category_id);
    
    // --- KIRIM ARRAY VARIAN ---
    // Kita kirim sebagai JSON string agar bisa diparse backend
    formData.append("variants", JSON.stringify(validVariants));

    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
    form.images.forEach((image) => formData.append("images", image));

    try {
      await axiosClient.post("/products", formData);
      setStatus({ type: "success", message: "Produk berhasil ditambahkan!" });
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
            Isi detail produk dan variannya (warna/ukuran/harga/stok).
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
            {/* INFORMASI DASAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-darkgray">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="mt-1 block w-full border border-lightmauve rounded-md p-2"
                />
              </div>

               <div className="col-span-2 md:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-darkgray">Kategori</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs text-elegantburgundy hover:text-softpink font-medium"
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
            </div>

            {/* --- INPUT VARIAN PRODUK --- */}
            <div className="border-t border-lightmauve pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-darkgray">Varian Produk</h3>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-sm bg-darkgray text-purewhite px-3 py-1 rounded hover:bg-opacity-80"
                  >
                    + Tambah Varian
                  </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-darkgray">
                    <thead className="text-xs text-darkgray uppercase bg-lightmauve">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Warna</th>
                            <th className="px-4 py-3">Ukuran</th>
                            <th className="px-4 py-3">Harga (Rp) <span className="text-red-500">*</span></th>
                            <th className="px-4 py-3">Stok <span className="text-red-500">*</span></th>
                            <th className="px-4 py-3 rounded-tr-lg">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant, index) => (
                            <tr key={index} className="border-b border-lightmauve">
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Merah"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="L, XL"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={variant.stock}
                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => removeVariantRow(index)}
                                        className="text-red-600 hover:text-red-800 font-bold"
                                        title="Hapus Baris"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Jika produk tidak memiliki varian warna/ukuran, kosongkan kolom tersebut. Harga dan Stok wajib diisi.
              </p>
            </div>


            {/* GAMBAR PRODUK */}
            <div className="border-t border-lightmauve pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-darkgray mb-1">
                    Gambar Thumbnail (Wajib)
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    required
                    className="block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
                  />
                  {form.thumbnail && (
                    <img
                      src={URL.createObjectURL(form.thumbnail)}
                      alt="Thumbnail Preview"
                      className="mt-3 h-32 w-32 object-cover rounded-md border border-gray-300"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgray mb-1">
                    Gambar Lainnya (Maks. 4)
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    className="block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
                  />
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {form.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-md text-base font-medium text-purewhite bg-elegantburgundy hover:bg-softpink disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>
        </div>
      </main>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={fetchCategories}
      />

      <WarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Validasi Gagal"
        message={modalMessage}
      />
    </div>
  );
};

export default AddProduct;