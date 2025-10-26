import React, { useState, useEffect } from "react";
import {
  fetchMovies,
  addMovie,
  deleteMovie,
  updateMovie,
} from "../api/movieAPI";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    genres: "",
    year: "",
    rating: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // === State mới để ẩn/hiện form ===
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    loadMovies(currentPage);
  }, [currentPage]);

  const loadMovies = async (page) => {
    try {
      const data = await fetchMovies(page);
      setMovies(data.movies);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Lỗi tải phim:", error);
      setMovies([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phim này?")) {
      await deleteMovie(id);
      loadMovies(currentPage);
    }
  };

  const handleEditClick = (movie) => {
    setEditingId(movie._id);
    setFormData({
      title: movie.title,
      genres: movie.genres ? movie.genres.join(", ") : "",
      year: movie.year || "",
      rating: movie.imdb?.rating || "",
    });
    // === Mở form khi nhấn Sửa ===
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", genres: "", year: "", rating: "" });
    // === Đóng form khi Hủy ===
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (logic chuẩn bị movieData giữ nguyên)
    const movieData = {
      title: formData.title,
      year: formData.year ? parseInt(formData.year) : null,
      genres: formData.genres.split(",").map((g) => g.trim()).filter((g) => g),
      imdb: { rating: formData.rating ? parseFloat(formData.rating) : null },
    };

    try {
      if (editingId) {
        await updateMovie(editingId, movieData);
      } else {
        await addMovie(movieData);
      }
      if (currentPage !== 1) setCurrentPage(1);
      else loadMovies(1);
      
      handleCancelEdit(); // Reset và đóng form
    } catch (error) {
      console.error("Lỗi khi lưu phim:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    // Container đồng bộ
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Phim</h2>
        {/* === Nút bật/tắt form === */}
        <button
          onClick={() => {
            // Nếu đang sửa mà nhấn nút -> Hủy
            if (editingId) {
              handleCancelEdit();
            } else {
              // Ngược lại, bật/tắt form
              setIsFormVisible(!isFormVisible);
            }
          }}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition-all
            ${isFormVisible ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
          `}
        >
          {isFormVisible && !editingId ? "Đóng Form" : "➕ Thêm phim mới"}
        </button>
      </div>

      {/* === Form ẩn/hiện === */}
      {isFormVisible && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "✍️ Chỉnh sửa phim" : "➕ Thêm phim mới"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* ... input giữ nguyên ... */}
            <input
              type="text"
              placeholder="Tên phim (*)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border rounded p-2 col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Thể loại (cách nhau bằng dấu phẩy)"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              className="border rounded p-2 col-span-2"
            />
            <input
              type="number"
              placeholder="Năm"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Rating (vd: 8.5)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="border rounded p-2"
            />
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
              >
                {editingId ? "Cập nhật" : "Thêm"}
              </button>
              {/* Nút hủy luôn hiển thị khi form mở */}
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách phim (dạng bảng) */}
      {movies.length === 0 ? (
        <p className="text-gray-500">Đang tải... hoặc không có dữ liệu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Cập nhật a */}
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên phim</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thể loại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Năm</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{m.genres ? m.genres.join(", ") : "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{m.year || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">⭐ {m.imdb?.rating || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right flex gap-3 justify-end">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bộ điều khiển phân trang */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-300"
        >
          Trang trước
        </button>
        <span className="text-sm text-gray-700">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-300"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default MovieList;