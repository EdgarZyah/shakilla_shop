import React from 'react';

const ModalHapus = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-darkgray mb-2">{title}</h3>
        <p className="text-darkgray/70 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapus;