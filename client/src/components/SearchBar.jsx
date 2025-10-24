import React, { useState } from 'react'; // <-- useEffect dihapus

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // <-- Dihapus

  // Efek untuk debouncing dihapus

  // Efek untuk memanggil fungsi onSearch dihapus

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // --- Handler untuk Submit Form ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Mencegah reload halaman
    onSearch(searchTerm); // Panggil onSearch saat submit
  };
  // --------------------------------

  return (
    // --- Diubah menjadi <form> ---
    <form className="flex-1 w-full max-w-sm" onSubmit={handleSubmit}>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg className="w-4 h-4 text-darkgray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full p-2 ps-10 text-sm text-darkgray border border-lightmauve rounded-lg bg-purewhite focus:ring-elegantburgundy focus:border-elegantburgundy"
          placeholder="Cari..."
          value={searchTerm}
          onChange={handleInputChange}
          required
        />
      </div>
    </form>
    // --- Akhir <form> ---
  );
};

export default SearchBar;