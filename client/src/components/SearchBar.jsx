import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Efek untuk debouncing
  useEffect(() => {
    // Atur timer untuk memperbarui debouncedSearchTerm setelah 500ms
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    // Fungsi cleanup: Hapus timer jika searchTerm berubah atau komponen dilepas
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Efek untuk memanggil fungsi onSearch
  useEffect(() => {
    // Panggil onSearch hanya ketika debouncedSearchTerm berubah
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex-1 w-full max-w-sm">
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
    </div>
  );
};

export default SearchBar;