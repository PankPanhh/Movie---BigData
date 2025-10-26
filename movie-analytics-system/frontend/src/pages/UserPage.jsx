// pages/UserPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchUsers,
  updateUser,
  deleteUser,
} from "../api/movieAPI";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import { useDebounce } from "../hooks/useDebounce";

export default function UserPage() {
  const [data, setData] = useState({
    items: [],
    totalPages: 1,
    currentPage: 1,
    totalData: 0, // <-- Thêm state
  });
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const loadData = useCallback(async (page, currentSearch) => {
    try {
      const res = await fetchUsers(page, 10, currentSearch);
      setData({
        items: res.data,
        totalPages: res.totalPages,
        currentPage: res.currentPage,
        totalData: res.totalData, // <-- Lưu state
      });
    } catch (error) {
      console.error("Lỗi tải user:", error);
    }
  }, []);

  useEffect(() => {
    loadData(1, debouncedSearch);
  }, [debouncedSearch, loadData]);

  const handlePageChange = (page) => {
    loadData(page, debouncedSearch);
  };

  const handleOpenModal = (item) => {
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
        await updateUser(editingItem._id, formData);
        loadData(data.currentPage, debouncedSearch);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteUser(id);
        loadData(data.currentPage, debouncedSearch);
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Quản lý Người dùng</h1>

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
            placeholder="Tìm kiếm theo tên, email..."
            className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Không có nút "Thêm mới" */}
      </div>

      {/* Bảng dữ liệu (UI MỚI) */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.items.map((item) => (
              <tr key={item._id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.email}</td>
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
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Sửa thông tin người dùng">
        <UserForm
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}