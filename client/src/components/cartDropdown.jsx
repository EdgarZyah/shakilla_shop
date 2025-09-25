// shakilla_shop/client/src/components/CartDropdown.jsx

import React from "react";
import { Link } from "react-router-dom";

const CartDropdown = ({ cartItems, onRemoveItem, isCartOpen, onToggle }) => {
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.Product?.price * item.quantity),
    0
  );

  return (
    <div
      className={`
        absolute -right-13 mt-4 w-80 bg-purewhite rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300 ease-out
        ${isCartOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
      `}
    >
      <div className="p-4 border-b font-semibold text-darkgray bg-lightmauve">
        Keranjang Belanja ({cartItems.length} item)
      </div>

      {cartItems.length === 0 ? (
        <div className="p-6 text-center text-darkgray">Keranjang kosong</div>
      ) : (
        <>
          <ul className="max-h-40 overflow-y-auto">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 bg-lightmauve transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={item.Product?.thumbnail_url} alt={item.Product?.name} className="h-10 w-10 object-cover rounded" />
                  <div>
                    <p className="font-semibold text-darkgray">{item.Product?.name}</p>
                    <p className="text-sm text-darkgray">
                        Qty: {item.quantity} | Ukuran: {item.size || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-elegantburgundy hover:text-softpink text-sm font-medium transition-colors"
                  aria-label={`Hapus ${item.Product?.name} dari keranjang`}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-lightmauve">
            <div className="flex justify-between font-semibold text-darkgray mb-3">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <Link
              to="/cart"
              onClick={onToggle}
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