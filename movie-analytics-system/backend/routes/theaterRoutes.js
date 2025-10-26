// routes/theaterRoutes.js
import express from "express";
import {
  getTheaters,
  addTheater,
  updateTheater,
  deleteTheater,
} from "../controllers/theaterController.js";

const router = express.Router();

router.get("/", getTheaters);
router.post("/", addTheater);
router.put("/:id", updateTheater);
router.delete("/:id", deleteTheater);

export default router;