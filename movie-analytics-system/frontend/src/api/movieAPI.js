import axios from "axios";

const API_URL = "http://localhost:5000/api/movies";

export const getMovies = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách phim:", err);
    return [];
  }
};
