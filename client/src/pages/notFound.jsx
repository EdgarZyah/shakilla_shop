// src/pages/NotFoundPage.jsx

import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-lightmauve text-darkgray">
      <div className="text-center p-8 max-w-lg mx-auto">
        <h1 className="text-9xl font-extrabold text-elegantburgundy mb-4">
          404
        </h1>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-lg mb-6 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dihapus, namanya diubah, atau tidak pernah ada.
        </p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 text-lg font-medium text-purewhite bg-elegantburgundy rounded-full hover:bg-softpink transition-colors duration-300 transform hover:scale-105"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;