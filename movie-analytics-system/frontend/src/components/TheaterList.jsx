// components/TheaterList.jsx
import React, { useState, useEffect } from "react";
import { getTheaterSample } from "../api/movieAPI"; // <-- Đổi hàm API

export default function TheaterList() {
  const [theaters, setTheaters] = useState([]);

  useEffect(() => {
    const loadTheaters = async () => {
      try {
        const res = await getTheaterSample(); // <-- Đổi hàm API
        setTheaters(res.data); // <-- Lấy .data
      } catch (error) {
        console.error("Lỗi tải rạp hát:", error);
      }
    };
    loadTheaters();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4">📍 Rạp hát (Mẫu 10)</h2>
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {theaters.length === 0 ? (
          <p className="text-gray-500">Không có dữ liệu rạp hát.</p>
        ) : (
          theaters.map((theater) => (
            <div key={theater._id} className="border-b border-gray-100 pb-2">
              <p className="text-sm font-medium text-gray-900">
                {theater.location?.address?.street1 || "Không rõ đường"}
              </p>
              <span className="text-xs text-gray-500">
                {theater.location?.address?.city},{" "}
                {theater.location?.address?.state}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}