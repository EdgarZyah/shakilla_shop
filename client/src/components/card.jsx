// frontend/src/components/Card.jsx
import React from "react";
import { Link } from "react-router-dom";

const Card = ({ product, onAddToCart }) => {
  if (!product) return null;

  const { id, name, price, brand, thumbnail_url } = product;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-lightmauve bg-purewhite shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Gambar Produk */}
      <Link
        to={`/productpage/${id}`}
        className="relative block w-full overflow-hidden rounded-t-2xl"
      >
        {thumbnail_url && (
          <img
            src={thumbnail_url}
            alt={name}
            className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
      </Link>

      {/* Badge Brand */}
      {brand && (
        <span className="absolute left-3 top-3 rounded-full bg-purewhite/80 px-3 py-1 text-xs font-medium text-darkgray backdrop-blur-sm">
          {brand}
        </span>
      )}

      {/* Konten */}
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
          <Link
            to={`/productpage/${id}`}
            className="hover:text-elegantburgundy text-xl font-bold text-darkgray"
          >
            <button
              onClick={() => onAddToCart?.(id)}
              className="group flex items-center gap-1 rounded-full bg-elegantburgundy hover:bg-gray-700 px-4 py-2 text-sm font-medium text-purewhite transition-all duration-300 hover:bg-softpink"
              aria-label={`Tambah ${name} ke keranjang`}
            >
              {/* Ikon Keranjang */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10" cy="21" r="3"></circle>
                <circle cx="20" cy="21" r="3"></circle>
                <path d="M1 1h4l2 13h13l-2-7H6"></path>
              </svg>
              <span className="hidden sm:inline">Beli</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
