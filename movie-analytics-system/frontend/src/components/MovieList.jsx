import { useEffect, useState } from "react";
import { getMovies } from "../api/movieAPI";

export default function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMovies();
      setMovies(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎥 Danh sách phim</h2>

      {movies.length === 0 ? (
        <p className="text-gray-500">Không có dữ liệu phim nào.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{movie.title}</h3>
              <p>Thể loại: {movie.genre}</p>
              <p>Năm: {movie.year}</p>
              <p>Điểm: {movie.rating}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
