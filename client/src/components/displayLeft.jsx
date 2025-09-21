import React, { useState, useEffect } from "react";
import Display from "../assets/displayLeft.png";
import { Link } from "react-router-dom";

const DisplayLeft = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // contoh data fashion
        const data = {
          title: "Style Unik Untukmu",
          description:
            "Mix and match fashion favoritmu dengan koleksi eksklusif. Tunjukkan jati diri lewat gaya berpakaian yang stylish.",
          button_text: "Lihat Koleksi",
          image_url: Display,
        };

        setTimeout(() => {
          setBanner(data);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Gagal memuat banner:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !banner) {
    return (
      <div className="w-full py-12 flex justify-center items-center text-darkgray">
        Loading...
      </div>
    );
  }

  return (
    <section className="py-12 px-6 bg-lightmauve">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-8 bg-purewhite rounded-xl shadow-md overflow-hidden">
        {/* Gambar */}
        <div className="h-full">
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover md:rounded-r-xl py-6"
          />
        </div>
        {/* Konten Teks */}
        <div className="p-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-elegantburgundy">
            {banner.title}
          </h2>
          <p className="text-darkgray mb-6">{banner.description}</p>
          <Link to="/products">
            <button className="bg-elegantburgundy text-purewhite px-6 py-3 rounded-full font-semibold hover:bg-softpink transition">
              {banner.button_text}
            </button>{" "}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DisplayLeft;
