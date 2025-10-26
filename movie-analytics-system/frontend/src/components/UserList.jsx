// components/UserList.jsx
import React, { useState, useEffect } from "react";
import { getUserSample } from "../api/movieAPI"; // <-- Đổi hàm API

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await getUserSample(); // <-- Đổi hàm API
        setUsers(res.data); // <-- Lấy .data
      } catch (error) {
        console.error("Lỗi tải người dùng:", error);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4">👥 Người dùng (Mẫu 10)</h2>
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {users.length === 0 ? (
          <p className="text-gray-500">Không có dữ liệu người dùng.</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className="border-b border-gray-100 pb-2">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <span className="text-xs text-gray-500">
                {user.email}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}