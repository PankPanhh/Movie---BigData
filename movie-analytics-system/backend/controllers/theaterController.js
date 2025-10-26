// controllers/theaterController.js
import Theater from "../models/Theater.js";
import mongoose from "mongoose";

// GET /api/theaters (Hỗ trợ Pagination & Search)
export const getTheaters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Tạo query tìm kiếm
    const query = search
      ? {
          $or: [
            { "location.address.city": { $regex: search, $options: "i" } },
            { "location.address.street1": { $regex: search, $options: "i" } },
            { "location.address.state": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalTheaters = await Theater.countDocuments(query);
    const totalPages = Math.ceil(totalTheaters / limit);

    const theaters = await Theater.find(query)
      .skip(skip)
      .limit(limit);

    res.json({
      data: theaters,
      currentPage: page,
      totalPages,
      totalData: totalTheaters,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi phía máy chủ" });
  }
};

// POST /api/theaters (Thêm rạp)
export const addTheater = async (req, res) => {
  try {
    const newTheater = new Theater(req.body);
    const savedTheater = await newTheater.save();
    res.status(201).json(savedTheater);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/theaters/:id (Cập nhật rạp)
export const updateTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTheater = await Theater.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTheater) return res.status(404).json({ error: "Không tìm thấy rạp" });
    res.json(updatedTheater);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/theaters/:id (Xóa rạp)
export const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTheater = await Theater.findByIdAndDelete(id);
    if (!deletedTheater) return res.status(404).json({ error: "Không tìm thấy rạp" });
    res.json({ message: "Xóa rạp thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};