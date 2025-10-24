// shakilla_shop/client/src/components/Table.jsx
import React from "react";

const Table = ({ columns, data, loading, onSort, sortBy, sortOrder, renderActions }) => {
  const SortIcon = ({ columnKey }) => {
    if (sortBy !== columnKey) {
      return (
        <svg className="w-4 h-4 text-darkgray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg className="w-4 h-4 text-elegantburgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-elegantburgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12 bg-purewhite">
        <svg
          className="mx-auto h-12 w-12 text-darkgray/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-darkgray">
          Tidak ada data ditemukan
        </h3>
        <p className="mt-2 text-darkgray/70">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-lightmauve">
        <thead className="bg-lightmauve">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-darkgray uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-softpink/50 transition-colors"
                onClick={() => column.sortable && onSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && <SortIcon columnKey={column.key} />}
                </div>
              </th>
            ))}
            {renderActions && (
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-darkgray uppercase tracking-wider whitespace-nowrap">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-purewhite divide-y divide-lightmauve">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-lightmauve transition-colors">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-darkgray">
                  {
                    // --- AWAL PERUBAHAN ---
                    column.render 
                      ? column.render(row, rowIndex) // 1. Kirim rowIndex ke render prop
                      : (column.key === 'no' ? rowIndex + 1 : row[column.key]) // 2. Tampilkan rowIndex + 1 jika key='no'
                    // --- AKHIR PERUBAHAN ---
                  }
                </td>
              ))}
              {renderActions && (
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;