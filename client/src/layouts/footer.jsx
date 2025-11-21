// client/src/layouts/footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-elegantburgundy text-purewhite py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center">
        <p className="text-sm text-center w-full"> ---------------------------- &copy;{new Date().getFullYear()} Shakilla Shop ---------------------------- </p>
      </div>
    </footer>
  );
};

export default Footer;