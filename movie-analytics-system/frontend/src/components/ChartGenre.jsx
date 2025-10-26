// components/ChartGenre.jsx
import { useEffect, useState } from "react";
import { getMovieSample } from "../api/movieAPI";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartGenre() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMovieSample();
        const movies = res.data;
        const grouped = movies.reduce((acc, m) => {
          const genre = m.genres && m.genres.length > 0 ? m.genres[0] : "Unknown";
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {});
        setData(Object.entries(grouped).map(([name, value]) => ({ name, value })));
      } catch (error) {
        console.error("Lỗi tải ChartGenre:", error);
      }
    };
    load();
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#ffbb28"];

  return (
    // Xóa wrapper, Dashboard.jsx sẽ bọc bên ngoài
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Thể loại (50 phim mẫu)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + (radius + 20) * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + (radius + 20) * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}