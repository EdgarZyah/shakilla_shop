import React from 'react';

const WarningModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex justify-center items-center p-4 z-50">
      <div className="bg-purewhite rounded-lg shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-elegantburgundy">{title}</h3>
          <button onClick={onClose} className="text-darkgray hover:text-elegantburgundy transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-softpink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-darkgray">{message}</p>
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose} 
            className="bg-elegantburgundy text-purewhite px-4 py-2 rounded-md font-semibold hover:bg-softpink transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;