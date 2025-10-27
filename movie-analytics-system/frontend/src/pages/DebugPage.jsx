import React, { useState } from "react";

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showFullBefore, setShowFullBefore] = useState(false);
  const [showFullAfter, setShowFullAfter] = useState(false);

  async function runCompare() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        "/api/debug/compare-index?runs=5&copy=false&drop=true"
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const extractSummary = (explain) => {
    if (!explain || explain.error)
      return { error: explain?.error || "No data" };
    const stats = explain.executionStats || explain;
    return {
      "Thời gian thực thi (ms)": stats.executionTimeMillis ?? "N/A",
      "Tổng tài liệu kiểm tra": stats.totalDocsExamined ?? "N/A",
      "Tổng khóa kiểm tra": stats.totalKeysExamined ?? "N/A",
      "Số lượng trả về": stats.nReturned ?? "N/A",
      "Giai đoạn": stats.executionStages?.stage ?? "N/A",
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Debug: So sánh Index (Trước / Sau)
      </h2>

      <div className="mb-6">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          onClick={runCompare}
          disabled={loading}
        >
          {loading ? "Đang chạy..." : "Chạy So sánh"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 border-l-4 border-red-500">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Tổng quan */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Tổng quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.collection}
                </div>
                <div className="text-sm text-gray-500">Bộ sưu tập</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.indexName || "Không"}
                </div>
                <div className="text-sm text-gray-500">Index được tạo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.collStats?.count || "N/A"}
                </div>
                <div className="text-sm text-gray-500">Tổng tài liệu</div>
              </div>
            </div>
          </div>

          {/* Trước khi tạo Index */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Trước khi tạo Index
            </h3>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Các chỉ số chính</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">
                      Chỉ số
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Giá trị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(extractSummary(result.explainBefore)).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td className="border border-gray-300 p-2 font-medium">
                          {key}
                        </td>
                        <td className="border border-gray-300 p-2">{value}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            <div className="mb-4">
              <strong>Thời gian chạy (ms):</strong>{" "}
              {result.timesBefore.join(", ")} | <strong>Trung vị:</strong>{" "}
              {result.medianBefore} ms
            </div>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setShowFullBefore(!showFullBefore)}
            >
              {showFullBefore ? "Ẩn" : "Hiển thị"} JSON Explain đầy đủ
            </button>
            {showFullBefore && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result.explainBefore, null, 2)}
              </pre>
            )}
          </div>

          {/* Sau khi tạo Index */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600">
              Sau khi tạo Index
            </h3>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Các chỉ số chính</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">
                      Chỉ số
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Giá trị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(extractSummary(result.explainAfter)).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td className="border border-gray-300 p-2 font-medium">
                          {key}
                        </td>
                        <td className="border border-gray-300 p-2">{value}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            <div className="mb-4">
              <strong>Thời gian chạy (ms):</strong>{" "}
              {result.timesAfter.join(", ")} | <strong>Trung vị:</strong>{" "}
              {result.medianAfter} ms
            </div>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setShowFullAfter(!showFullAfter)}
            >
              {showFullAfter ? "Ẩn" : "Hiển thị"} JSON Explain đầy đủ
            </button>
            {showFullAfter && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result.explainAfter, null, 2)}
              </pre>
            )}
          </div>

          {/* Thống kê Index */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Thống kê Index & Collection
            </h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result.collStats, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
