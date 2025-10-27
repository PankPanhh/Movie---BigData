// routes/movieRoutes.js
import express from "express";
// Import tất cả các hàm controller
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getGenreDistribution,
  getMoviesByYear,
  getTopRatedMovies,
  getAnalyticsDashboard,
  getGenreYearMatrix,
  getYearDiagnostics,
} from "../controllers/movieController.js";

const router = express.Router();

// CRUD Routes
// GET /api/movies/
router.get("/", getMovies);

// POST /api/movies/ (Thêm route này)
router.post("/", addMovie);

// PUT /api/movies/:id (Thêm route này)
router.put("/:id", updateMovie);

// DELETE /api/movies/:id (Thêm route này)
router.delete("/:id", deleteMovie);

// ===== AGGREGATION ROUTES CHO BIG DATA DEMO =====

// GET /api/movies/analytics/genre-distribution
router.get("/analytics/genre-distribution", getGenreDistribution);

// GET /api/movies/analytics/by-year
router.get("/analytics/by-year", getMoviesByYear);

// GET /api/movies/analytics/top-rated
router.get("/analytics/top-rated", getTopRatedMovies);

// GET /api/movies/analytics/dashboard
router.get("/analytics/dashboard", getAnalyticsDashboard);

// GET /api/movies/analytics/genre-year-matrix
router.get("/analytics/genre-year-matrix", getGenreYearMatrix);

// GET /api/movies/analytics/year-diagnostics
router.get("/analytics/year-diagnostics", getYearDiagnostics);

export default router;
