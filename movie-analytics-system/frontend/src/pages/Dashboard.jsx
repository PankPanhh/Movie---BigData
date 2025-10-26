import MovieList from "../components/MovieList";
import ChartGenre from "../components/ChartGenre";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        🎬 Movie Analytics Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MovieList />
        <ChartGenre />
      </div>
    </div>
  );
}
