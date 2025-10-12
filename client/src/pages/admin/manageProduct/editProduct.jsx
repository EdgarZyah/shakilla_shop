// src/pages/admin/manageProduct/editProduct.jsx
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useParams, useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal";
import axiosClient from "../../../api/axiosClient";
import { getCleanedImageUrl } from "../../../utils/imageHelper"; // ✅ gunakan helper resmi

const EditProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    thumbnail: null,
    existingThumbnail: "",
    images: [],
    existingImages: [],
    category_id: "",
  });
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

      let imagePaths = [];
      if (data.image_url && typeof data.image_url === "string") {
        try {
          imagePaths = JSON.parse(data.image_url);
        } catch (e) {
          console.error("Gagal parse image_url:", e);
        }
      } else if (Array.isArray(data.image_url)) {
        imagePaths = data.image_url;
      }

      setForm({
        name: data.name,
        price: data.price,
        description: data.description,
        stock: data.stock,
        thumbnail: null,
        existingThumbnail: data.thumbnail_url || "",
        images: [],
        existingImages: imagePaths,
        category_id: data.category_id,
      });
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
      e.target.value = null;
      return;
    }
    if (files.length + form.existingImages.length + form.images.length > 4) {
      setModalMessage("Maksimal 4 gambar utama diperbolehkan.");
      setIsModalOpen(true);
      e.target.value = null;
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
      setStatus({ type: "error", message: "Gambar thumbnail wajib diisi." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("category_id", form.category_id);

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

  const totalImages = form.existingImages.length + form.images.length;

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
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
            Edit Produk
          </h1>
          <p className="text-darkgray/70">
            Perbarui informasi untuk produk {form.name}.
          </p>
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
            {/* Nama Produk */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-darkgray"
              >
                Nama Produk
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Harga */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-darkgray"
              >
                Harga
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Stok */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-darkgray"
              >
                Stok
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={form.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-darkgray"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="4"
                className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-darkgray"
              >
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail */}
            <div>
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-darkgray"
              >
                Gambar Thumbnail (Wajib)
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
              />
              {(form.thumbnail || form.existingThumbnail) && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={
                      form.thumbnail
                        ? URL.createObjectURL(form.thumbnail)
                        : getCleanedImageUrl(form.existingThumbnail)
                    }
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
              )}
            </div>

            {/* Gambar Lain */}
            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium text-darkgray"
              >
                Gambar Produk Lainnya (Maks. 4)
              </label>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagesChange}
                className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink"
                disabled={totalImages >= 4}
              />
              <div className="mt-4 flex flex-wrap gap-4">
                {form.existingImages.map((path, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={getCleanedImageUrl(path)} // ✅ gunakan helper yang sama
                      alt={`Produk ${index}`}
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(path)}
                      className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {form.images.map((image, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
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
