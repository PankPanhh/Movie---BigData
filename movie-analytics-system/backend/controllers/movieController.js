import Movie from "../models/Movie.js";

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error("❌ Error fetching movies:", error.message);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu phim" });
  }
};
