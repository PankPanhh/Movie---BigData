// components/StatsCards.jsx
import React, { useState, useEffect } from "react";
import { getStats, getMovieSample } from "../api/movieAPI";

// Component con (UI MỚI)
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white shadow-lg rounded-xl p-5 flex items-center space-x-4
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`p-3 rounded-full ${color.bg} ${color.text}`}>
      {icon}
    </div>
    <div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

// Icons SVG
const icons = {
  movies: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3.75 12h16.5" /></svg>,
  rating: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.491 0 .702.657.337.95l-4.435 3.226a.563.563 0 00-.162.63l2.125 5.111a.563.563 0 01-.84.605l-4.435-3.226a.563.563 0 00-.65 0l-4.435 3.226a.563.563 0 01-.84-.605l2.125-5.111a.563.563 0 00-.162-.63l-4.435-3.226c-.364-.293-.154-.95.337-.95h5.513a.563.563 0 00.475-.31l2.125-5.111z" /></svg>,
  genre: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-3m0 0H6M5.25 6v3m0 3v.75m0 3v.75m0 3V18m3-1.5H12m-3 0H6m0 0H3m3 0h3m-3 0c-.621 0-1.125.504-1.125 1.125V18c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V16.5m-5.25 0h5.25" /></svg>,
};

// Màu
const colors = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
};

export default function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    commonGenre: "N/A",
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getStats();
        const total = statsData.totalData;
        
        const moviesRes = await getMovieSample();
        const moviesSample = moviesRes.data;

        let totalRating = 0, count = 0;
        moviesSample.forEach((m) => {
          if (m.imdb?.rating) {
            totalRating += m.imdb.rating;
            count++;
          }
        });
        const avgRating = count > 0 ? (totalRating / count).toFixed(1) : "N/A";

        const grouped = moviesSample.reduce((acc, m) => {
          const genre = m.genres && m.genres.length > 0 ? m.genres[0] : null;
          if (genre) acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {});
        const commonGenre = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        setStats({ total, avgRating, commonGenre });
      } catch (error) {
        console.error("Lỗi tải stats:", error);
      }
    };
    loadStats();
  }, []);

  return (
    // Xóa wrapper, vì Dashboard.jsx đã bọc rồi
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Tổng số phim" value={stats.total.toLocaleString()} icon={icons.movies} color={colors.blue} />
      <StatCard title="Rating TB (50 mẫu)" value={`⭐ ${stats.avgRating}`} icon={icons.rating} color={colors.yellow} />
      <StatCard title="Thể loại phổ biến (50 mẫu)" value={stats.commonGenre} icon={icons.genre} color={colors.green} />
    </div>
  );
}