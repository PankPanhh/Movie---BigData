// components/Modal.jsx
import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4
                 transition-opacity duration-300 ease-out"
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-all duration-300 ease-out
                   transform scale-95 opacity-0"
        // Thêm JS một chút để trigger animation
        style={{ transform: "scale(1)", opacity: 1 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}