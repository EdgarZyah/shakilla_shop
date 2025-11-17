import React from "react";
import { Link } from "react-router-dom";
import { getCleanedImageUrl } from "../utils/imageHelper"; // <-- IMPORT RESMI

// --- HAPUS FUNGSI FALLBACK ---

// --- Helper Varian ---
const getPriceDisplay = (variants) => {
  if (!variants || variants.length === 0) {
    return "Harga tidak tersedia";
  }
  const prices = variants.map(v => parseFloat(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return `Rp ${minPrice.toLocaleString("id-ID")}`;
  } else {
    return `Rp ${minPrice.toLocaleString("id-ID")}`;
  }
};

const Card = ({ product }) => {
  if (!product) return null;
  
  // --- HAPUS TERNARY CHECK ---
  const imageUrl = getCleanedImageUrl(product.thumbnail_url); // <-- LANGSUNG PAKAI
  const priceDisplay = getPriceDisplay(product.variants);
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  const isOutOfStock = totalStock === 0;

  return (
    <div className="relative m-auto flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-lightmauve bg-purewhite shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl"
        to={`/productpage/${product.id}`}
      >
        <img
          className="h-full w-full object-cover"
          src={imageUrl} // <-- Variabel yang sudah bersih
          alt={product.name}
        />
        {isOutOfStock && (
            <span className="absolute top-0 left-0 m-2 rounded-full bg-red-600/80 px-2 text-center text-sm font-medium text-white">
                Stok Habis
            </span>
        )}
      </Link>
      <div className="mt-4 px-5 pb-5">
        <Link to={`/productpage/${product.id}`}>
          <h5 className="text-xl tracking-tight text-darkgray font-semibold truncate">
            {product.name}
          </h5>
        </Link>
        <div className="mt-2 mb-4 flex items-center justify-between">
          <p>
            <span className="text-2xl font-bold text-elegantburgundy">
              {priceDisplay}
            </span>
          </p>
        </div>
        <Link
          to={`/productpage/${product.id}`}
          className={`flex items-center justify-center rounded-md px-5 py-2.5 text-center text-sm font-medium text-purewhite transition-colors duration-200
            ${isOutOfStock 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-elegantburgundy hover:bg-softpink hover:text-elegantburgundy focus:outline-none focus:ring-4 focus:ring-blue-300"
            }`}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Lihat Detail" : "Beli Sekarang"}
        </Link>
      </div>
    </div>
  );
};

export default Card;