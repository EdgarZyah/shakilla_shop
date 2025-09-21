import React from "react";
import Card from "./card";
import { Link } from "react-router-dom";

const ProductDisplay = ({ products = [], onAddToCart }) => {
  // Batasi produk yang ditampilkan maksimal 8 item
  const displayedProducts = products.slice(0, 8);

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-lightmauve">
        <p className="text-xl font-medium text-darkgray">
          Produk tidak tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-lightmauve">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-elegantburgundy sm:text-5xl">
            Koleksi Produk
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-darkgray">
            Temukan produk favorit Anda dari koleksi kami yang beragam.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {displayedProducts.map((product) => (
            <Card
              key={product.id}
              product={product}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="bg-elegantburgundy hover:bg-gray-700 p-3 rounded-md text-md text-purewhite inline-block"
          >
            More Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
