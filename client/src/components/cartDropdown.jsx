import React from "react";
import { Link } from "react-router-dom";
import { getCleanedImageUrl } from "../utils/imageHelper"; // <-- IMPORT RESMI

// --- HAPUS FUNGSI FALLBACK ---

const CartDropdown = ({ cartItems, onRemoveItem, isCartOpen, onToggle }) => {
  
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.productVariant?.price ? parseFloat(item.productVariant.price) : 0;
    const qty = item.quantity ? parseInt(item.quantity) : 0;
    return total + price * qty;
  }, 0);

  // --- HAPUS TERNARY CHECK (getImageUrl) ---

  return (
    <div
      className={`absolute right-0 mt-4 w-80 bg-purewhite rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300 ease-out
        ${
          isCartOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
    >
      <div className="p-4 border-b font-semibold text-darkgray bg-lightmauve">
        Keranjang Belanja ({cartItems.length} item)
      </div>

      {cartItems.length === 0 ? (
        <div className="p-6 text-center text-darkgray">Keranjang kosong</div>
      ) : (
        <>
          <ul className="max-h-64 overflow-y-auto">
            {cartItems.map((item) => {
              const variant = item.productVariant;
              const product = variant?.product;
              if (!variant || !product) return null;

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-lightmauve/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getCleanedImageUrl(product.thumbnail_url)} // <-- LANGSUNG PAKAI
                      alt={product.name}
                      className="h-10 w-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-darkgray truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-darkgray/80 truncate">
                        Qty: {item.quantity || 1}
                        {variant.color && (
                          <span className="ml-1">| {variant.color}</span>
                        )}
                        {variant.size && (
                          <span className="ml-1">| {variant.size}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors ml-2"
                    aria-label={`Hapus ${product.name} dari keranjang`}
                  >
                    Hapus
                  </button>
                </li>
              );
            })}
          </ul>
         <div className="p-4 bg-lightmauve">
            <div className="flex justify-between font-semibold text-darkgray mb-3">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <Link
              to="/cart"
              onClick={onToggle} // Menutup dropdown saat navigasi
              className="w-full flex justify-center bg-elegantburgundy text-purewhite py-2 rounded-lg hover:bg-gray-700 shadow-md transition-colors"
            >
              Lihat Keranjang
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDropdown;