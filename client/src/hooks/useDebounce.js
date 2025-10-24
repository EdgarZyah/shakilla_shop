// client/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  // State untuk menyimpan nilai yang di-debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout untuk update nilai setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bersihkan timeout jika nilai berubah sebelum delay selesai
    // atau jika komponen unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya re-run efek jika value atau delay berubah

  return debouncedValue;
}

export default useDebounce;