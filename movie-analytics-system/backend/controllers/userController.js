// controllers/userController.js
import User from "../models/User.js";
import mongoose from "mongoose";

// GET (với Pagination & Search, loại bỏ password)
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .select("-password") // <-- RẤT QUAN TRỌNG
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      currentPage: page,
      totalPages,
      totalData: totalUsers,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi phía máy chủ" });
  }
};

// PUT (Cập nhật name, email)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Chỉ cho phép cập nhật name và email
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email }, // Chỉ cập nhật các trường an toàn
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "Không tìm thấy user" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "Không tìm thấy user" });
    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};