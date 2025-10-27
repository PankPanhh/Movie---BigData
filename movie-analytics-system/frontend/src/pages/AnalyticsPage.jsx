import React, { useState, useEffect, useMemo, useRef } from "react";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Ref to hold current fetch's AbortController so we can cancel inflight requests
  const fetchControllerRef = useRef(null);

  const tabs = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard Tổng quan",
        endpoint: "/api/movies/analytics/dashboard",
      },
      {
        id: "genres",
        label: "Phân bố Thể loại",
        endpoint: "/api/movies/analytics/genre-distribution",
      },
      {
        id: "years",
        label: "Theo Năm",
        endpoint: "/api/movies/analytics/by-year",
      },
      {
        id: "toprated",
        label: "Top Rating",
        endpoint: "/api/movies/analytics/top-rated",
      },
    ],
    []
  );

  const fetchData = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      // Abort previous request if any
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }

      const controller = new AbortController();
      fetchControllerRef.current = controller;

      const res = await fetch(endpoint, { signal: controller.signal });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();

      // If this request was aborted, skip setting state
      if (controller.signal.aborted) return;

      // Normalize response shape so UI rendering is stable
      const normalized = {
        title: result.title || "",
        description: result.description || "",
        // prefer result.data to be an array; handle nested shapes
        data: Array.isArray(result.data)
          ? result.data
          : result.data && Array.isArray(result.data.data)
          ? result.data.data
          : Array.isArray(result)
          ? result
          : [],
        // preserve other fields if present
        ...result,
      };

      setData(normalized);
    } catch (err) {
      // Don't show abort errors to the user
      if (err.name !== "AbortError") setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    if (currentTab) {
      fetchData(currentTab.endpoint);
    }

    // cleanup on activeTab change/unmount: abort inflight request
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [activeTab, tabs]);

  // (moved fetchControllerRef earlier)

  const renderDashboard = () => {
    if (!data || !data.data) return null;

    // Defensive normalization: backend may return different shapes
    const overview = (data.data && data.data.overview) || [];
    const topGenres = (data.data && data.data.topGenres) || [];
    const byDecade = (data.data && data.data.byDecade) || [];
    const recentTopRated = (data.data && data.data.recentTopRated) || [];

    return (
      <div className="space-y-6">
        {/* Tổng quan */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Tổng quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {overview[0]?.totalMovies || 0}
              </div>
              <div className="text-sm text-gray-500">Tổng phim</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {overview[0]?.avgRating?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-gray-500">Rating TB</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {overview &&
                overview[0] &&
                overview[0].minYear !== null &&
                typeof overview[0].minYear === "number"
                  ? Math.floor(overview[0].minYear)
                  : "Chưa có"}
              </div>
              <div className="text-sm text-gray-500">Năm cũ nhất</div>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Top 5 Thể loại
          </h3>
          <div className="space-y-2">
            {topGenres.map((genre, index) => (
              <div
                key={genre._id}
                className="flex justify-between items-center"
              >
                <span className="font-medium">
                  {index + 1}. {genre._id}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {genre.count} phim
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Decade */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Theo Thập kỷ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDecade.map((decade) => (
              <div key={decade._id} className="border rounded p-4">
                <div className="font-medium">
                  {decade._id === "Other" ? "Khác" : `${decade._id}s`}
                </div>
                <div className="text-sm text-gray-600">{decade.count} phim</div>
                <div className="text-sm text-gray-600">
                  Rating TB: {decade.avgRating?.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Top Rated */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Top Rating (10 năm gần nhất)
          </h3>
          <div className="space-y-2">
            {recentTopRated.map((movie, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-sm text-gray-600">{movie.year}</div>
                </div>
                <div className="text-yellow-600 font-bold">{movie.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGenres = () => {
    if (!data || !data.data) return null;

    // Normalize to array in case backend returned an object unexpectedly
    const items = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.data.data)
      ? data.data.data
      : [];

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {data.title}
        </h3>
        <p className="text-gray-600 mb-4">{data.description}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">
                  Thể loại
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Số phim
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Rating TB
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="border border-gray-300 p-2 font-medium">
                    {item._id}
                  </td>
                  <td className="border border-gray-300 p-2">{item.count}</td>
                  <td className="border border-gray-300 p-2">
                    {item.avgRating?.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderYears = () => {
    if (!data || !data.data) return null;

    const items = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.data.data)
      ? data.data.data
      : [];

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {data.title}
        </h3>
        <p className="text-gray-600 mb-4">{data.description}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Năm</th>
                <th className="border border-gray-300 p-2 text-left">
                  Số phim
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Rating TB
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="border border-gray-300 p-2 font-medium">
                    {item._id}
                  </td>
                  <td className="border border-gray-300 p-2">{item.count}</td>
                  <td className="border border-gray-300 p-2">
                    {item.avgRating?.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTopRated = () => {
    if (!data || !data.data) return null;

    const items = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.data.data)
      ? data.data.data
      : [];

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {data.title}
        </h3>
        <p className="text-gray-600 mb-4">{data.description}</p>
        <div className="space-y-4">
          {items.map((movie, index) => (
            <div
              key={index}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium text-lg">{movie.title}</h4>
                <p className="text-gray-600">{movie.year}</p>
                <p className="text-sm text-gray-500">
                  {movie.genres?.join(", ")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {movie.rating}
                </div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "genres":
        return renderGenres();
      case "years":
        return renderYears();
      case "toprated":
        return renderTopRated();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Analytics - MongoDB Aggregation Pipeline
      </h2>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 border-l-4 border-red-500">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && renderContent()}
    </div>
  );
}
