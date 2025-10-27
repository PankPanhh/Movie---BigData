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
    if (!updatedMovie)
      return res.status(404).json({ error: "Không tìm thấy phim" });
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
    if (!deletedMovie)
      return res.status(404).json({ error: "Không tìm thấy phim" });
    res.json({ message: "Xóa phim thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== AGGREGATION ENDPOINTS CHO BIG DATA DEMO =====

// 1. Phân bố phim theo thể loại (Genre Distribution)
export const getGenreDistribution = async (req, res) => {
  try {
    const pipeline = [
      // Convert year to numeric (yearNum) to avoid string garbage like "2014è"
      {
        $addFields: {
          yearNum: {
            $convert: {
              input: "$year",
              to: "int",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      // Unwind genres array để có một document cho mỗi genre
      { $unwind: "$genres" },
      // Group by genre và count
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 },
          avgRating: { $avg: "$imdb.rating" },
          minYear: { $min: "$yearNum" },
          maxYear: { $max: "$yearNum" },
        },
      },
      // Sort by count descending
      { $sort: { count: -1 } },
      // Limit top 20 genres
      { $limit: 20 },
    ];

    const result = await Movie.aggregate(pipeline);
    res.json({
      title: "Phân bố phim theo thể loại",
      description:
        "Thống kê số lượng phim và rating trung bình cho mỗi thể loại",
      data: result,
      totalGenres: result.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Thống kê phim theo năm (Movies by Year)
export const getMoviesByYear = async (req, res) => {
  try {
    const pipeline = [
      // Convert year to number for reliable filtering/grouping
      {
        $addFields: {
          yearNum: {
            $convert: {
              input: "$year",
              to: "int",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      // Match để lọc năm nếu cần (sử dụng yearNum)
      {
        $match: {
          yearNum: { $gte: 1900, $lte: new Date().getFullYear() },
        },
      },
      // Group by yearNum
      {
        $group: {
          _id: "$yearNum",
          count: { $sum: 1 },
          avgRating: { $avg: "$imdb.rating" },
          topGenres: {
            $push: { $arrayElemAt: ["$genres", 0] }, // Lấy genre đầu tiên
          },
        },
      },
      // Sort by year descending
      { $sort: { _id: -1 } },
      // Limit recent 50 years
      { $limit: 50 },
    ];

    const result = await Movie.aggregate(pipeline);
    res.json({
      title: "Thống kê phim theo năm",
      description: "Số lượng phim và rating trung bình theo từng năm",
      data: result,
      totalYears: result.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Top-rated movies (Phim có rating cao nhất)
export const getTopRatedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const minVotes = parseInt(req.query.minVotes) || 1000; // Giả sử có trường votes

    const pipeline = [
      // Match movies with valid rating
      {
        $match: {
          "imdb.rating": { $exists: true, $ne: null },
          // Nếu có trường votes: "imdb.votes": { $gte: minVotes }
        },
      },
      // Sort by rating descending
      { $sort: { "imdb.rating": -1 } },
      // Limit results
      { $limit: limit },
      // Project fields
      {
        $project: {
          title: 1,
          year: 1,
          genres: 1,
          rating: "$imdb.rating",
          // votes: "$imdb.votes"
        },
      },
    ];

    const result = await Movie.aggregate(pipeline);
    res.json({
      title: "Top-rated movies",
      description: `Top ${limit} phim có rating cao nhất`,
      data: result,
      limit: limit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Analytics Dashboard - Kết hợp nhiều thống kê (Facet)
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const pipeline = [
      {
        $facet: {
          // Thống kê tổng quan — convert year sang số trước khi tính min/max để tránh giá trị chuỗi như "2014è"
          overview: [
            // Tạo trường yearNum cố gắng convert các giá trị year (string/number) sang int
            {
              $addFields: {
                yearNum: {
                  $convert: {
                    input: "$year",
                    to: "int",
                    onError: null,
                    onNull: null,
                  },
                },
              },
            },
            // Lọc chỉ giữ documents có yearNum hợp lệ
            {
              $match: {
                yearNum: {
                  $ne: null,
                  $gte: 1800,
                  $lte: new Date().getFullYear() + 1,
                },
              },
            },
            {
              $group: {
                _id: null,
                totalMovies: { $sum: 1 },
                avgRating: { $avg: "$imdb.rating" },
                minYear: { $min: "$yearNum" },
                maxYear: { $max: "$yearNum" },
              },
            },
            {
              $project: {
                totalMovies: 1,
                avgRating: { $round: ["$avgRating", 1] },
                minYear: 1,
                maxYear: 1,
              },
            },
          ],

          // Top 5 genres
          topGenres: [
            { $unwind: "$genres" },
            {
              $group: {
                _id: "$genres",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],

          // Movies by decade
          byDecade: [
            {
              $bucket: {
                groupBy: "$year",
                boundaries: [
                  1900, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030,
                ],
                default: "Other",
                output: {
                  count: { $sum: 1 },
                  avgRating: { $avg: "$imdb.rating" },
                },
              },
            },
          ],

          // Recent top rated (last 10 years)
          recentTopRated: [
            {
              $match: {
                year: { $gte: new Date().getFullYear() - 10 },
                "imdb.rating": { $exists: true, $ne: null },
              },
            },
            { $sort: { "imdb.rating": -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                year: 1,
                rating: "$imdb.rating",
              },
            },
          ],
        },
      },
    ];

    const result = await Movie.aggregate(pipeline);
    res.json({
      title: "Analytics Dashboard",
      description: "Tổng quan thống kê phim với nhiều khía cạnh",
      data: result[0] || {
        overview: [{ totalMovies: 0, avgRating: 0, minYear: 0, maxYear: 0 }],
        topGenres: [],
        byDecade: [],
        recentTopRated: [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Genre-Year Matrix (Ma trận thể loại theo năm)
export const getGenreYearMatrix = async (req, res) => {
  try {
    const pipeline = [
      // Convert year to number to avoid string artifacts
      {
        $addFields: {
          yearNum: {
            $convert: {
              input: "$year",
              to: "int",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      // Unwind genres
      { $unwind: "$genres" },
      // Group by yearNum and genre
      {
        $group: {
          _id: {
            year: "$yearNum",
            genre: "$genres",
          },
          count: { $sum: 1 },
          avgRating: { $avg: "$imdb.rating" },
        },
      },
      // Sort by year desc, then count desc
      { $sort: { "_id.year": -1, count: -1 } },
      // Limit to avoid too much data
      { $limit: 100 },
      // Reshape for easier consumption
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          genre: "$_id.genre",
          count: 1,
          avgRating: { $round: ["$avgRating", 1] },
        },
      },
    ];

    const result = await Movie.aggregate(pipeline);
    res.json({
      title: "Ma trận thể loại theo năm",
      description:
        "Số lượng phim và rating trung bình cho mỗi thể loại theo năm",
      data: result,
      totalRecords: result.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Year diagnostics - kiểm tra dữ liệu trường `year` để debug min/max null
export const getYearDiagnostics = async (req, res) => {
  try {
    // Tổng số document
    const total = await Movie.countDocuments();

    // Số document có trường year tồn tại và là number
    const withNumber = await Movie.countDocuments({
      year: { $type: "number" },
    });

    // Số document có year là string
    const withString = await Movie.countDocuments({
      year: { $type: "string" },
    });

    // Số document có year null
    const withNull = await Movie.countDocuments({ year: null });

    // Số document không có trường year
    const withoutYear = await Movie.countDocuments({
      year: { $exists: false },
    });

    // Top 20 năm lớn nhất (từ documents có year kiểu number)
    const topYears = await Movie.aggregate([
      { $match: { year: { $type: "number" } } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 20 },
    ]);

    // Sample vài document có year không phải number (giúp debug nếu có strings)
    const sampleNonNumber = await Movie.find({
      $or: [
        { year: { $type: "string" } },
        { year: null },
        { year: { $exists: false } },
      ],
    })
      .limit(10)
      .select("title year")
      .lean();

    res.json({
      total,
      withNumber,
      withString,
      withNull,
      withoutYear,
      topYears,
      sampleNonNumber,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
