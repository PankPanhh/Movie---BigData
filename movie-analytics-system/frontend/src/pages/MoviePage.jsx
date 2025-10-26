// pages/MoviePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../api/movieAPI";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import MovieForm from "../components/MovieForm";
import { useDebounce } from "../hooks/useDebounce";

export default function MoviePage() {
  const [data, setData] = useState({
    items: [],
    totalPages: 1,
    currentPage: 1,
    totalData: 0, // <-- Thêm state để lưu tổng số
  });
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const loadData = useCallback(async (page, currentSearch) => {
    try {
      const res = await fetchMovies(page, 10, currentSearch);
      setData({
        items: res.data,
        totalPages: res.totalPages,
        currentPage: res.currentPage,
        totalData: res.totalData, // <-- Lưu tổng số
      });
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    }
  }, []);

  useEffect(() => {
    loadData(1, debouncedSearch);
  }, [debouncedSearch, loadData]);

  const handlePageChange = (page) => {
    loadData(page, debouncedSearch);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await updateMovie(editingItem._id, formData);
      } else {
        await addMovie(formData);
      }
      loadData(1, debouncedSearch);
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phim này?")) {
      try {
        await deleteMovie(id);
        loadData(data.currentPage, debouncedSearch);
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Quản lý Phim</h1>

      {/* Thanh công cụ: Tìm kiếm và Thêm mới (UI MỚI) */}
      <div className="flex justify-between items-center mb-6">
        {/* Search Input với Icon */}
        <div className="relative w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phim, thể loại..."
            className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Nút Thêm mới với Icon */}
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm phim mới
        </button>
      </div>

      {/* Bảng dữ liệu (UI MỚI) */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên phim</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thể loại</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Năm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.items.map((item) => (
              <tr key={item._id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.genres.join(", ")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">⭐ {item.imdb?.rating || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(item)} className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150 mr-4">Sửa</button>
                  <button onClick={() => handleDelete(item._id)} className="font-medium text-red-600 hover:text-red-800 transition-colors duration-150">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang (UI MỚI) */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Hiển thị {data.items.length} trên tổng số {data.totalData || 0} mục
        </span>
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Sửa phim" : "Thêm phim"}>
        <MovieForm
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}