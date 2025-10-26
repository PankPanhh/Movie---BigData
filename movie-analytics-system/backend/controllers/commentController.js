// controllers/commentController.js
import Comment from "../models/Comment.js";
import mongoose from "mongoose";

// GET (với Pagination, Search, và Populate)
export const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { text: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalComments = await Comment.countDocuments(query);
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find(query)
      .populate("movie_id", "title") // <-- Lấy tên phim liên kết
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: comments,
      currentPage: page,
      totalPages,
      totalData: totalComments,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi phía máy chủ" });
  }
};

// DELETE
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) return res.status(404).json({ error: "Không tìm thấy comment" });
    res.json({ message: "Xóa comment thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};