// scripts/checkData.js - Kiểm tra và sửa dữ liệu năm phim
import mongoose from "mongoose";
import Movie from "../models/Movie.js";

async function checkAndFixYears() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/movie-analytics"
    );

    console.log("🔍 Đang kiểm tra dữ liệu năm phim...");

    // 1. Thống kê tổng quan
    const totalMovies = await Movie.countDocuments();
    console.log(`📊 Tổng số phim: ${totalMovies}`);

    // 2. Kiểm tra phim có năm null/undefined
    const nullYears = await Movie.countDocuments({
      year: { $in: [null, undefined] },
    });
    console.log(`⚠️  Phim không có năm: ${nullYears}`);

    // 3. Kiểm tra năm min/max
    const yearStats = await Movie.aggregate([
      {
        $match: {
          year: { $exists: true, $ne: null, $type: "number" },
        },
      },
      {
        $group: {
          _id: null,
          minYear: { $min: "$year" },
          maxYear: { $max: "$year" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (yearStats.length > 0) {
      const { minYear, maxYear, count } = yearStats[0];
      console.log(`📅 Năm phim: ${minYear} - ${maxYear} (${count} phim)`);
    }

    // 4. Top 10 phim mới nhất
    const latestMovies = await Movie.find({
      year: { $exists: true, $ne: null },
    })
      .sort({ year: -1 })
      .limit(10)
      .select("title year");

    console.log("\n🎬 Top 10 phim mới nhất:");
    latestMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.year}: ${movie.title}`);
    });

    // 5. Kiểm tra phim năm 2015+
    const recentMovies = await Movie.find({
      year: { $gte: 2015 },
    })
      .select("title year")
      .limit(5);

    console.log(`\n📈 Phim từ năm 2015 trở đi: ${recentMovies.length} phim`);
    if (recentMovies.length > 0) {
      recentMovies.forEach((movie) => {
        console.log(`   ${movie.year}: ${movie.title}`);
      });
    } else {
      console.log("   Không có phim từ năm 2015 trở đi");
    }

    console.log("\n✅ Hoàn thành kiểm tra dữ liệu");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Chạy nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAndFixYears();
}

export default checkAndFixYears;
