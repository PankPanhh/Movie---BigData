// components/ChartYear.jsx
import { useEffect, useState } from "react";
import { getMovieSample } from "../api/movieAPI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function ChartYear() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMovieSample();
        const movies = res.data;
        const grouped = movies.reduce((acc, m) => {
          const year = m.year || "Unknown";
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});
        
        const chartData = Object.entries(grouped)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => parseInt(a.name) - parseInt(b.name));
          
        setData(chartData);
      } catch (error) {
        console.error("Lỗi tải ChartYear:", error);
      }
    };
    load();
  }, []);

  return (
    // Xóa wrapper, Dashboard.jsx sẽ bọc bên ngoài
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Phim theo năm (50 phim mẫu)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#82ca9d" name="Số lượng phim" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}