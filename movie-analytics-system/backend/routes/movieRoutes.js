// routes/movieRoutes.js
import express from "express";
// Import tất cả các hàm controller
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";

const router = express.Router();

// GET /api/movies/
router.get("/", getMovies);

// POST /api/movies/ (Thêm route này)
router.post("/", addMovie);

// PUT /api/movies/:id (Thêm route này)
router.put("/:id", updateMovie);

// DELETE /api/movies/:id (Thêm route này)
router.delete("/:id", deleteMovie);

export default router;