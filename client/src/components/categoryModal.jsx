// src/components/CategoryModal.jsx
import React, { useState } from "react";
import axiosClient from "../api/axiosClient";

const CategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleNewCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setStatus({ type: "error", message: "Nama kategori wajib diisi." });
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post("/categories", { name: newCategoryName });

      setStatus({ type: "success", message: "Kategori berhasil ditambahkan!" });
      setNewCategoryName("");

      // callback agar parent bisa reload data
      if (onCategoryAdded) onCategoryAdded();

      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1200);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal membuat kategori.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-purewhite p-8 rounded-lg shadow-xl w-96">
        <h3 className="text-xl font-bold mb-4 text-darkgray">Tambah Kategori Baru</h3>

        {status && (
          <div
            className={`p-3 mb-3 text-sm rounded-md ${
              status.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleNewCategorySubmit}>
          <label
            htmlFor="newCategory"
            className="block text-sm font-medium text-darkgray"
          >
            Nama Kategori
          </label>
          <input
            type="text"
            id="newCategory"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
            required
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
