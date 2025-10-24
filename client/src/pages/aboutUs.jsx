import React from "react";
import Hero from "../components/hero.jsx";
import Navbar from "../layouts/navbar.jsx";
import Footer from "../layouts/footer.jsx";
import WhatsappOverlay from "../components/whatsappOverlay";
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-lightmauve flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <Hero />
      <main className="flex-1 space-y-8 sm:space-y-12 lg:space-y-16 py-12">
        {/* Content */}
        <section className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-purewhite rounded-lg shadow-md p-6 sm:p-10">
            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-elegantburgundy">
              Tentang Shakilla Shop
            </h1>

            {/* Description */}
            <p className="text-darkgray mb-6 leading-relaxed text-base sm:text-lg">
              Shakilla Shop merupakan e-commerce yang menyediakan koleksi
              fashion terbaru dan berkualitas untuk semua kalangan. Kami
              berkomitmen menghadirkan pengalaman belanja kebutuhan fashion yang
              mudah, aman, dan nyaman, lengkap dengan layanan pelanggan yang
              ramah.
            </p>

            {/* Map Section */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-elegantburgundy">
                Lokasi Toko Kami
              </h2>
              <div className="rounded-lg overflow-hidden shadow-md aspect-video">
                <iframe
                  title="Lokasi Toko Shakilla Shop"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.487112611886!2d108.7642418!3d-7.299039999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f7f29614eefab%3A0x7f868a330aaeb73f!2sSHAKILLA%20Shop!5e0!3m2!1sid!2sid!4v1759564890105!5m2!1sid!2sid"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            {/* Contact Link */}
            <div className="text-darkgray mt-8 text-sm sm:text-base">
              <p>
                Hubungi kami untuk pertanyaan, kerjasama melalui contact WhatsApp kami.
              </p>
            </div>
          </div>
        </section>
      </main>
      <WhatsappOverlay />
      <Footer />
    </div>
  );
};

export default AboutUs;
