import { useEffect, useState } from "react";
import { getMovies } from "../api/movieAPI";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";

export default function ChartGenre() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const movies = await getMovies();
      const grouped = movies.reduce((acc, m) => {
        acc[m.genre] = (acc[m.genre] || 0) + 1;
        return acc;
      }, {});
      setData(Object.entries(grouped).map(([name, value]) => ({ name, value })));
    };
    load();
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Thống kê thể loại</h2>
      <PieChart width={400} height={300}>
        <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
