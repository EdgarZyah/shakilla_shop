// src/pages/admin/manageProduct/editProduct.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../../layouts/sidebar";
import { adminMenu } from "../../../layouts/layoutAdmin/adminMenu";
import { useParams, useNavigate } from "react-router-dom";
import WarningModal from "../../../components/warningModal"; // Import komponen modal

const EditProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "", // <-- Menambahkan state stock
    thumbnail: null,
    existingThumbnail: "",
    images: [],
    existingImages: [],
    category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal
  const [modalMessage, setModalMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // Daftar MIME types yang diizinkan untuk validasi frontend
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  
  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data produk.");
      }

      let imageUrls = [];
      if (data.image_url && typeof data.image_url === "string") {
        try {
          imageUrls = JSON.parse(data.image_url);
        } catch (e) {
          console.error("Gagal mengurai image_url JSON string:", e);
        }
      } else if (Array.isArray(data.image_url)) {
        imageUrls = data.image_url;
      }

      setForm({
        name: data.name,
        price: data.price,
        description: data.description,
        stock: data.stock, // <-- Mengambil nilai stock
        thumbnail: null,
        existingThumbnail: data.thumbnail_url || "",
        images: [],
        existingImages: imageUrls || [],
        category_id: data.category_id,
      });
      setLoading(false);
    } catch (err) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan saat mengambil produk." });
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        console.error("Gagal mengambil kategori:", data.message);
      }
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
        e.target.value = null; // Reset input file
        return;
    }
    
    if (files.length + form.existingImages.length > 4) {
      setModalMessage("Maksimal 4 gambar utama diperbolehkan.");
      setIsModalOpen(true);
      e.target.value = null;
      return;
    }

    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleRemoveExistingImage = (urlToRemove) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(url => url !== urlToRemove),
    }));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };
  
  const handleRemoveExistingThumbnail = () => {
    setForm((prev) => ({ ...prev, existingThumbnail: "" }));
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
    formData.append("existing_images", JSON.stringify(form.existingImages));
    if (form.thumbnail) {
        formData.append("thumbnail", form.thumbnail);
    }

    form.images.forEach((image) => {
        formData.append("images", image);
    });
    
    if (form.images.length + form.existingImages.length > 4) {
        setStatus({ type: "error", message: "Maksimal 4 gambar utama diperbolehkan." });
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Produk berhasil diperbarui!" });
        setTimeout(() => {
          navigate("/admin/list-produk");
        }, 2000);
      } else {
        setStatus({ type: "error", message: data.message || "Gagal memperbarui produk." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
        <span className="ml-4 text-xl font-semibold text-darkgray">Memuat data produk...</span>
      </div>
    );
  }

  const existingImagesCount = form.existingImages.length;
  const remainingUploads = 4 - existingImagesCount;

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar menu={adminMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">Edit Produk</h1>
          <p className="text-darkgray/70">Perbarui informasi produk {form.name}.</p>
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
              <label htmlFor="category_id" className="block text-sm font-medium text-darkgray">Kategori</label>
              <select id="category_id" name="category_id" value={form.category_id} onChange={handleInputChange} className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2" required>
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Input Thumbnail Baru */}
            <div>
              <label className="block text-sm font-medium text-darkgray">Gambar Thumbnail</label>
              {form.existingThumbnail && !form.thumbnail ? (
                <div className="mt-2 relative">
                  <img src={form.existingThumbnail} alt="Thumbnail Saat Ini" className="h-32 w-32 object-cover rounded-md" />
                  <button type="button" onClick={handleRemoveExistingThumbnail} className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : null}
              <input type="file" id="newThumbnail" name="thumbnail" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink" />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray">Gambar Saat Ini ({existingImagesCount}/{4})</label>
              <div className="mt-2 flex flex-wrap gap-4">
                {form.existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Produk ${index}`} className="h-32 w-32 object-cover rounded-md" />
                    <button type="button" onClick={() => handleRemoveExistingImage(url)} className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="newImages" className="block text-sm font-medium text-darkgray">Unggah Gambar Baru (Maks. {remainingUploads})</label>
              <input type="file" id="newImages" name="images" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImagesChange} className="mt-1 block w-full text-sm text-darkgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lightmauve file:text-elegantburgundy hover:file:bg-softpink" disabled={remainingUploads <= 0} />
              <div className="mt-4 flex flex-wrap gap-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="h-32 w-32 object-cover rounded-md" />
                    <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-1 right-1 bg-elegantburgundy text-purewhite rounded-full p-1 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-purewhite bg-elegantburgundy hover:bg-softpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elegantburgundy disabled:opacity-50">
              {loading ? "Memperbarui..." : "Perbarui Produk"}
            </button>
          </form>
        </div>
      </main>
      
      <WarningModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Warning!"
        message={modalMessage}
      />
    </div>
  );
};

export default EditProduct;