// client/src/components/Contact.jsx

import React, { useState } from "react";

const CATEGORIES = [
  "Select a category",
  "Order & Payment",
  "Product Info",
  "Shipping",
  "Warranty/Claim",
  "Other",
];

// Nomor WhatsApp tujuan
const WHATSAPP_NUMBER = "6289503609911"; // Ganti dengan nomor WhatsApp Anda (tanpa tanda +)

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    product: "",
    purchased: "",
    question: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleRadio = (value) => {
    setForm((prev) => ({
      ...prev,
      purchased: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.category ||
      form.category === "Select a category" ||
      !form.question ||
      form.purchased === ""
    ) {
      setStatus({
        success: false,
        message: "Semua field dengan tanda (*) wajib diisi.",
      });
      return;
    }

    // Bangun pesan WhatsApp dengan format rapi
    const message = `*Shakilla Shop – Customer Inquiry*

━━━━━━━━━━━━━━━
*Nama:* ${form.firstName} ${form.lastName}
*Email:* ${form.email}
*Kategori:* ${form.category}
*Produk:* ${form.product || "N/A"}
*Sudah membeli?:* ${form.purchased}
━━━━━━━━━━━━━━━

*Pertanyaan:*
${form.question}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Arahkan ke WhatsApp
    window.open(whatsappUrl, "_blank");

    setStatus({
      success: true,
      message: "Pesan berhasil dibuat! Anda akan diarahkan ke WhatsApp.",
    });

    // Reset form
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      category: "",
      product: "",
      purchased: "",
      question: "",
    });
  };

  return (
    <div className="w-full h-full py-10 px-2 bg-lightmauve text-darkgray">
      <div className="max-w-7xl mx-auto bg-purewhite shadow-xl rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-elegantburgundy">
          WhatsApp Support
        </h1>
        <p className="text-sm mb-6">
          Selamat datang di Layanan Pelanggan Shakilla Shop. Isi detail Anda di
          bawah ini dan kami akan menggunakan informasi tersebut untuk layanan
          pelanggan. Kami sangat menghargai privasi Anda dan tidak akan
          membagikan data Anda kepada pihak ketiga.
        </p>
        {status && (
          <div
            className={`mb-4 p-3 rounded ${
              status.success
                ? "bg-green-100 text-green-700"
                : "bg-softpink text-elegantburgundy"
            }`}
          >
            {status.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-darkgray font-medium mb-1">
                Nama Depan <span className="text-elegantburgundy">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full border border-darkgray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-darkgray font-medium mb-1">
                Nama Belakang <span className="text-elegantburgundy">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full border border-darkgray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-darkgray font-medium mb-1">
              Alamat Email <span className="text-elegantburgundy">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="w-full border border-darkgray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-darkgray font-medium mb-1">
                Kategori <span className="text-elegantburgundy">*</span>
              </label>
              <select
                name="category"
                className="w-full border border-darkgray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                value={form.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-darkgray font-medium mb-1">
                Produk
              </label>
              <input
                type="text"
                name="product"
                className="w-full border border-darkgray rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
                value={form.product}
                onChange={handleChange}
                placeholder="Opsional"
              />
            </div>
          </div>
          <div>
            <label className="block text-darkgray font-medium mb-1">
              Apakah Anda sudah membeli produk?{" "}
              <span className="text-elegantburgundy">*</span>
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purchased"
                  value="Yes"
                  checked={form.purchased === "Yes"}
                  onChange={() => handleRadio("Yes")}
                  className="mr-2"
                  required
                />
                Ya
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purchased"
                  value="No"
                  checked={form.purchased === "No"}
                  onChange={() => handleRadio("No")}
                  className="mr-2"
                />
                Tidak
              </label>
            </div>
          </div>
          <div>
            <label className="block text-darkgray font-medium mb-1">
              Pertanyaan <span className="text-elegantburgundy">*</span>
            </label>
            <textarea
              name="question"
              rows={4}
              className="w-full border border-darkgray rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
              value={form.question}
              onChange={handleChange}
              required
              placeholder="Tuliskan apa yang ingin Anda ketahui..."
            />
          </div>
          <div className="mt-2 text-darkgray text-sm">
            Mohon berikan informasi selengkap mungkin mengenai masalah Anda.
          </div>
          <button
            type="submit"
            className="w-full bg-elegantburgundy text-purewhite rounded py-2 font-bold text-lg mt-4 hover:bg-gray-700 transition"
          >
            Kirim via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
