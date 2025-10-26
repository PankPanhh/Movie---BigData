// components/RecentComments.jsx
import React, { useState, useEffect } from "react";
import { getCommentSample } from "../api/movieAPI";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} năm trước`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} tháng trước`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} ngày trước`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} giờ trước`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} phút trước`;
  return `${Math.floor(seconds)} giây trước`;
};

// Icon Avatar
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


export default function RecentComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await getCommentSample();
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi tải bình luận:", error);
      }
    };
    loadComments();
  }, []);

  return (
    // Xóa wrapper, Dashboard.jsx sẽ bọc bên ngoài
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Bình luận gần đây</h2>
      <div className="space-y-5 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">Không có bình luận nào.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                <UserIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-snug">"{comment.text}"</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-semibold text-gray-800">
                    — {comment.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(comment.date)}
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  trong: {comment.movie_id?.title || "Không rõ"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}