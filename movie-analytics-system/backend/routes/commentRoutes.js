// routes/commentRoutes.js
import express from "express";
import {
  getComments,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getComments);
router.delete("/:id", deleteComment);

export default router;