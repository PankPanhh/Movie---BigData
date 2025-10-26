// controllers/movieController.js
import Movie from "../models/Movie.js";
import mongoose from "mongoose";

// GET (với Pagination & Search)
export const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { genres: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalMovies = await Movie.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / limit);

    const movies = await Movie.find(query)
      .select("title year genres imdb.rating poster")
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    res.json({
      data: movies,
      currentPage: page,
      totalPages,
      totalData: totalMovies,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi phía máy chủ" });
  }
};

// POST (Đã có, giữ nguyên)
export const addMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT (Đã có, giữ nguyên)
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedMovie) return res.status(404).json({ error: "Không tìm thấy phim" });
    res.json(updatedMovie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE (Đã có, giữ nguyên)
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMovie = await Movie.findByIdAndDelete(id);
    if (!deletedMovie) return res.status(404).json({ error: "Không tìm thấy phim" });
    res.json({ message: "Xóa phim thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};