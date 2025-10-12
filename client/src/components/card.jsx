// client/src/components/card.jsx
import React from "react";
import { Link } from "react-router-dom";

// === Helper untuk URL gambar aman lintas environment ===
const getCleanedImageUrl = (relativePath) => {
  if (!relativePath) return "";

  const API_URL = import.meta.env.VITE_API_URL || "https://api2.logikarya.my.id/api";
  const BASE_URL = API_URL.replace(/\/api\/?$/, ""); // hapus '/api' di akhir

  // Pastikan path tanpa double slash
  const cleanPath = relativePath.replace(/^\/+/, "");
  return `${BASE_URL}/${cleanPath}`;
};

const Card = ({ product, onAddToCart }) => {
  if (!product) return null;

  const { id, name, price, brand, thumbnail_url, stock } = product;
  const isOutOfStock = stock <= 0;

  // ✅ Gunakan helper untuk membangun URL aman
  const imageUrl = thumbnail_url ? getCleanedImageUrl(thumbnail_url) : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-lightmauve bg-purewhite shadow-sm transition-all duration-300 hover:shadow-lg">
      <Link
        to={`/productpage/${id}`}
        className="relative block w-full overflow-hidden rounded-t-2xl"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        )}
      </Link>

      {isOutOfStock ? (
        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-purewhite">
          Stok Habis
        </span>
      ) : (
        brand && (
          <span className="absolute left-3 top-3 rounded-full bg-purewhite/80 px-3 py-1 text-xs font-medium text-darkgray backdrop-blur-sm">
            {brand}
          </span>
        )
      )}

      <div className="flex flex-col gap-2 p-4 md:p-5">
        <Link to={`/productpage/${id}`} className="hover:text-elegantburgundy">
          <h3 className="text-lg font-semibold text-darkgray line-clamp-2">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <Link
            to={`/productpage/${id}`}
            className="hover:text-elegantburgundy text-xl font-bold text-darkgray"
          >
            Rp {price?.toLocaleString("id-ID")}
          </Link>

          <button
            onClick={() => onAddToCart?.(id)}
            className={`group flex items-center gap-1 rounded-full ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-elegantburgundy hover:bg-gray-700"
            } px-4 py-2 text-sm font-medium text-purewhite transition-all duration-300`}
            aria-label={`Tambah ${name} ke keranjang`}
            disabled={isOutOfStock}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="10" cy="21" r="3" />
              <circle cx="20" cy="21" r="3" />
              <path d="M1 1h4l2 13h13l-2-7H6" />
            </svg>
            <span className="hidden sm:inline">Beli</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
