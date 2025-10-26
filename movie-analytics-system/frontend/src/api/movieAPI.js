// src/api/movieAPI.js
import axios from "axios";
const API_BASE_URL = "http://localhost:5000/api";

// Hàm chung để xử lý params
const api = axios.create({ baseURL: API_BASE_URL });
const get = async (endpoint, params) => {
  const res = await api.get(endpoint, { params });
  return res.data;
};

// === CRUD & Pagination (Cho các trang Quản lý) ===

// Theaters CRUD
export const fetchTheaters = (page = 1, limit = 10, search = "") =>
  get("/theaters", { page, limit, search });
export const addTheater = (theater) => api.post("/theaters", theater);
export const updateTheater = (id, theater) =>
  api.put(`/theaters/${id}`, theater);
export const deleteTheater = (id) => api.delete(`/theaters/${id}`);

// Movies CRUD
export const fetchMovies = (page = 1, limit = 10, search = "") =>
  get("/movies", { page, limit, search });
export const addMovie = (movie) => api.post("/movies", movie);
export const updateMovie = (id, movie) => api.put(`/movies/${id}`, movie);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);

// === Users CRUD ===
export const fetchUsers = (page = 1, limit = 10, search = "") =>
  get("/users", { page, limit, search });
  
// DÒNG NÀY ĐÃ ĐƯỢC BỎ COMMENT (FIX LỖI)
export const updateUser = (id, user) => api.put(`/users/${id}`, user); 
export const deleteUser = (id) => api.delete(`/users/${id}`);

// === Comments CRUD ===
export const fetchComments = (page = 1, limit = 10, search = "") =>
  get("/comments", { page, limit, search });
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// === Dashboard Analytics (HÀM CHO TRANG DASHBOARD) ===

// Lấy 50 phim mẫu cho biểu đồ
export const getMovieSample = () => get("/movies", { page: 1, limit: 50 });

// Lấy 10 bình luận mẫu
export const getCommentSample = () => get("/comments", { page: 1, limit: 10 });

// Lấy 10 rạp hát mẫu
export const getTheaterSample = () => get("/theaters", { page: 1, limit: 10 });

// Lấy 10 người dùng mẫu
export const getUserSample = () => get("/users", { page: 1, limit: 10 });

// Lấy tổng số liệu (totalData)
export const getStats = () => get("/movies", { page: 1, limit: 1 });