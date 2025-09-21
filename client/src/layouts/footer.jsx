// client/src/layouts/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-elegantburgundy text-purewhite py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Shakilla Shop. All rights reserved.</p>
        <div className="space-x-4 mt-3 md:mt-0">
          <a href="/about" className="hover:underline">
            About Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;