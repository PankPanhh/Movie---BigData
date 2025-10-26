// components/Pagination.jsx
import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  
  // Logic hiển thị trang thông minh hơn
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getPageNumbers();

  // Component Nút
  const PageButton = ({ children, onClick, disabled, isActive = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-10 h-10 mx-1 rounded-lg transition-colors
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex justify-center items-center space-x-1">
      {/* Nút Đầu */}
      <PageButton onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        «
      </PageButton>
      {/* Nút Trước */}
      <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        ‹
      </PageButton>

      {/* Trang đầu tiên nếu cần */}
      {visiblePages[0] > 1 && (
        <>
          <PageButton onClick={() => onPageChange(1)}>1</PageButton>
          <span className="text-gray-400">...</span>
        </>
      )}

      {/* Các trang ở giữa */}
      {visiblePages.map((number) => (
        <PageButton
          key={number}
          onClick={() => onPageChange(number)}
          isActive={currentPage === number}
        >
          {number}
        </PageButton>
      ))}

      {/* Trang cuối nếu cần */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          <span className="text-gray-400">...</span>
          <PageButton onClick={() => onPageChange(totalPages)}>{totalPages}</PageButton>
        </>
      )}

      {/* Nút Sau */}
      <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        ›
      </PageButton>
      {/* Nút Cuối */}
      <PageButton onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        »
      </PageButton>
    </div>
  );
}