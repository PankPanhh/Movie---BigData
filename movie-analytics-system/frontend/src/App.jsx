// App.jsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MoviePage from "./pages/MoviePage";
import TheaterPage from "./pages/TheaterPage";
import UserPage from "./pages/UserPage";
import CommentPage from "./pages/CommentPage";
import DebugPage from "./pages/DebugPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/theaters" element={<TheaterPage />} />
          <Route path="/movies" element={<MoviePage />} />
          <Route path="/users" element={<UserPage />} />
          <Route path="/comments" element={<CommentPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
