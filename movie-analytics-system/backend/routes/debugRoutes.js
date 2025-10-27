import express from "express";
import { compareIndex } from "../controllers/debugController.js";

const router = express.Router();

// GET /api/debug/compare-index?copy=true&drop=true&runs=5&genre=Action&minYear=2010
router.get("/compare-index", compareIndex);

export default router;
