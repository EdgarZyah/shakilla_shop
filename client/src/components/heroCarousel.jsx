// frontend/src/components/Carousel.jsx
import React, { useState } from "react";

const images = [
  "https://www.shutterstock.com/image-illustration/clothes-on-sand-dune-background-600nw-2490651895.jpg", // contoh gambar fashion
  "https://static.vecteezy.com/system/resources/thumbnails/023/902/307/small_2x/colorful-clothes-hang-on-hangers-illustration-ai-generative-free-photo.jpg",
  "https://st3.depositphotos.com/14521116/37182/i/450/depositphotos_371824998-stock-photo-stack-colorful-perfectly-folded-clothing.jpg",
];

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-1/2 mx-auto overflow-hidden">
      {/* Images */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            className="w-full h-[70vh] md:h-[90vh] flex-shrink-0 object-cover"
          />
        ))}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex h-full bg-gradient-to-b from-black/70 to-black/40">
        <div className="relative container m-auto px-6 py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-purewhite">
            Koleksi <span className="text-softpink">Fashion Terbaru</span>
          </h1>
          <p className="text-lg md:text-xl text-lightmauve mb-6 max-w-2xl">
            Tampil percaya diri dengan pilihan outfit trendi dan berkualitas
            dari Shakilla Shop. Belanja mudah, cepat, dan aman hanya di sini!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/products"
              className="px-6 py-3 bg-elegantburgundy hover:bg-gray-700 rounded-lg text-purewhite font-semibold transition"
            >
              Belanja Sekarang
            </a>
          </div>
        </div>
      </div>

      {/* Prev Button */}
      <button
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        aria-label="Slide berikutnya"
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
      >
        ❯
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Pindah ke slide ${index + 1}`}
            className={`w-3 h-3 rounded-full transition ${
              current === index ? "bg-white" : "bg-gray-500/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
