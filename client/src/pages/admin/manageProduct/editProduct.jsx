import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useParams, useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal";
import axiosClient from "../../../api/axiosClient";
import { getCleanedImageUrl } from "../../../utils/imageHelper";

const EditProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    thumbnail: null,
    existingThumbnail: "",
    images: [],
    existingImages: [],
    category_id: "",
  });
  
  // State Varian: Termasuk ID jika varian sudah ada di DB
  const [variants, setVariants] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/categories");
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/products/${id}`);
      const data = res.data.product;

      // Parse Images
      let imagePaths = [];
      if (data.image_url && typeof data.image_url === "string") {
        try {
            imagePaths = JSON.parse(data.image_url);
        } catch (e) { console.error(e); }
      } else if (Array.isArray(data.image_url)) {
        imagePaths = data.image_url;
      }

      setForm({
        name: data.name,
        description: data.description,
        thumbnail: null,
        existingThumbnail: data.thumbnail_url || "",
        images: [],
        existingImages: imagePaths,
        category_id: data.category_id,
      });

      // Set Variants dari Database
      if (data.variants && data.variants.length > 0) {
          setVariants(data.variants.map(v => ({
              id: v.id, // Penting untuk update
              color: v.color || "",
              size: v.size || "",
              price: v.price,
              stock: v.stock
          })));
      } else {
          // Fallback jika data lama belum punya varian (seharusnya tidak terjadi setelah migrasi baru)
          setVariants([{ color: "", size: "", price: "", stock: "" }]);
      }

    } catch (err) {
      setStatus({ type: "error", message: "Gagal mengambil data produk." });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [fetchProduct, fetchCategories]);

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
    const newVariants = variants.filter((_, i) => i !== index);
    // Jangan biarkan kosong sama sekali
    if (newVariants.length === 0) {
         setVariants([{ color: "", size: "", price: "", stock: "" }]);
    } else {
         setVariants(newVariants);
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
    setForm((prev) => ({ ...prev, thumbnail: file, existingThumbnail: "" }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.some((file) => !allowedTypes.includes(file.type))) {
      setModalMessage("Hanya file gambar (JPG, PNG, WEBP) yang diizinkan.");
      setIsModalOpen(true);
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveExistingImage = (pathToRemove) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((path) => path !== pathToRemove),
    }));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: null, existingThumbnail: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.thumbnail && !form.existingThumbnail) {
      setModalMessage("Gambar thumbnail wajib diisi.");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setStatus(null);

    const validVariants = variants.filter(v => v.price !== "" && v.stock !== "");
     if (validVariants.length === 0) {
        setModalMessage("Mohon isi minimal satu varian lengkap.");
        setIsModalOpen(true);
        setLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category_id", form.category_id);

    // Kirim variants sebagai JSON String
    formData.append("variants", JSON.stringify(validVariants));

    formData.append("existing_images", JSON.stringify(form.existingImages));
    formData.append("existing_thumbnail", form.existingThumbnail || "");

    if (form.thumbnail) {
      formData.append("thumbnail", form.thumbnail);
    }
    form.images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await axiosClient.put(`/products/${id}`, formData);
      setStatus({ type: "success", message: "Produk berhasil diperbarui!" });
      setTimeout(() => navigate("/admin/list-produk"), 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memperbarui produk.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">Edit Produk</h1>
          <p className="text-darkgray/70">Perbarui informasi dan varian produk.</p>
        </div>

        {status && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
             {/* INFO UMUM */}
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
                    <label className="block text-sm font-medium text-darkgray">Kategori</label>
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

            {/* --- EDIT VARIAN --- */}
            <div className="border-t border-lightmauve pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-darkgray">Edit Varian</h3>
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
                            <th className="px-4 py-3">Warna</th>
                            <th className="px-4 py-3">Ukuran</th>
                            <th className="px-4 py-3">Harga (Rp)</th>
                            <th className="px-4 py-3">Stok</th>
                            <th className="px-4 py-3">Aksi</th>
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
                                        placeholder="XL"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => removeVariantRow(index)}
                                        className="text-red-600 hover:text-red-800 font-bold"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>

            {/* Thumbnail & Images Section (Sama seperti sebelumnya) */}
            <div className="border-t border-lightmauve pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-darkgray">Thumbnail</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="mt-1 block w-full text-sm"
                    />
                     {(form.thumbnail || form.existingThumbnail) && (
                        <div className="mt-2 relative inline-block">
                        <img
                            src={form.thumbnail ? URL.createObjectURL(form.thumbnail) : getCleanedImageUrl(form.existingThumbnail)}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded border"
                        />
                         <button type="button" onClick={handleRemoveThumbnail} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs">X</button>
                        </div>
                     )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-darkgray">Gambar Lain</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagesChange}
                        className="mt-1 block w-full text-sm"
                    />
                    <div className="mt-2 flex gap-2 flex-wrap">
                         {form.existingImages.map((path) => (
                             <div key={path} className="relative">
                                 <img src={getCleanedImageUrl(path)} className="h-20 w-20 object-cover rounded border" alt="img"/>
                                 <button type="button" onClick={() => handleRemoveExistingImage(path)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">X</button>
                             </div>
                         ))}
                         {form.images.map((file, idx) => (
                             <div key={idx} className="relative">
                                 <img src={URL.createObjectURL(file)} className="h-20 w-20 object-cover rounded border" alt="new"/>
                                 <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">X</button>
                             </div>
                         ))}
                    </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-purewhite bg-elegantburgundy hover:bg-softpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elegantburgundy disabled:opacity-50"
            >
              {loading ? "Memperbarui..." : "Perbarui Produk"}
            </button>
          </form>
        </div>
      </main>

      <WarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Peringatan!"
        message={modalMessage}
      />
    </div>
  );
};

export default EditProduct;