import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-darkgray bg-purewhite hover:bg-lightmauve disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sebelumnya
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
            currentPage === number
              ? "bg-elegantburgundy text-purewhite border-elegantburgundy"
              : "bg-purewhite text-darkgray hover:bg-lightmauve"
          }`}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-darkgray bg-purewhite hover:bg-lightmauve disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Selanjutnya
      </button>
    </nav>
  );
};

export default Pagination;