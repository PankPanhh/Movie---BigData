// pages/CommentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchComments,
  deleteComment,
} from "../api/movieAPI";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

export default function CommentPage() {
  const [data, setData] = useState({
    items: [],
    totalPages: 1,
    currentPage: 1,
    totalData: 0, // <-- Thêm state
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const loadData = useCallback(async (page, currentSearch) => {
    try {
      const res = await fetchComments(page, 10, currentSearch);
      setData({
        items: res.data,
        totalPages: res.totalPages,
        currentPage: res.currentPage,
        totalData: res.totalData, // <-- Lưu state
      });
    } catch (error) {
      console.error("Lỗi tải comment:", error);
    }
  }, []);

  useEffect(() => {
    loadData(1, debouncedSearch);
  }, [debouncedSearch, loadData]);

  const handlePageChange = (page) => {
    loadData(page, debouncedSearch);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      try {
        await deleteComment(id);
        loadData(data.currentPage, debouncedSearch);
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Quản lý Bình luận</h1>

      {/* Thanh công cụ: Chỉ có Tìm kiếm (UI MỚI) */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung, tên, email..."
            className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng dữ liệu (UI MỚI) */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nội dung</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người gửi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phim</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.items.map((item) => (
              <tr key={item._id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate" title={item.text}>{item.text}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.movie_id?.title || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(item.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
    </div>
  );
}