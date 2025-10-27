// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import các routes
import movieRoutes from "./routes/movieRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // <-- THÊM DÒNG NÀY
import debugRoutes from "./routes/debugRoutes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Định tuyến API
app.use("/api/movies", movieRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/users", userRoutes); // <-- THÊM DÒNG NÀY
app.use("/api/debug", debugRoutes);

// ... (Phần kết nối DB và app.listen giữ nguyên) ...
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
