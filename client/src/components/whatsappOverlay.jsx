// client/src/components/WhatsappOverlay.jsx
import React from "react";

const WhatsappOverlay = () => {
  return (
    <a
      href="https://wa.link/lkft2g" // Ganti dengan nomor WhatsApp kamu (format internasional)
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition"
    >
      {/* WhatsApp SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-7 h-7"
      >
        <path d="M12.04 2C6.58 2 2.14 6.44 2.14 11.9c0 2.1.55 4.16 1.61 5.97L2 22l4.27-1.73c1.73.94 3.68 1.44 5.77 1.44h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.826 9.826 0 0 0 12.04 2zm.01 17.9h-.01c-1.73 0-3.41-.47-4.89-1.36l-.35-.21-2.54 1.03.68-2.41-.25-.38a8.3 8.3 0 0 1-1.3-4.47c0-4.57 3.72-8.29 8.3-8.29 2.22 0 4.3.86 5.87 2.42a8.24 8.24 0 0 1 2.43 5.87c0 4.57-3.72 8.3-8.29 8.3zm4.65-6.2c-.25-.13-1.47-.73-1.7-.82-.23-.09-.4-.13-.56.13-.17.25-.65.82-.8.99-.15.17-.3.19-.55.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.73-.15-.25-.02-.39.11-.52.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.76-1.83-.2-.49-.4-.42-.56-.43-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.32-.23.25-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.76 4.39 3.87.61.26 1.09.42 1.47.54.62.2 1.18.17 1.62.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
      </svg>
    </a>
  );
};

export default WhatsappOverlay;
