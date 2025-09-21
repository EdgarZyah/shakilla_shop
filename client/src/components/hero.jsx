// frontend/src/components/Hero.jsx
const Hero = () => {
  return (
    <section className="relative text-purewhite">
      {/* Background Image */}
      <img
        src="https://img.freepik.com/free-photo/fashion-clothes-hanger_23-2150405470.jpg?w=1380"
        alt="Fashion Background"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-darkgray opacity-50"></div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Tampil Lebih <span className="text-softpink">Stylish</span> Setiap
          Hari
        </h1>
        <p className="text-lg md:text-xl text-lightmauve mb-6 max-w-2xl">
          Koleksi terbaru fashion pilihan untuk lengkapi gaya kamu. Dari kasual
          hingga elegan, semua ada di sini.
        </p>
      </div>
    </section>
  );
};

export default Hero;
