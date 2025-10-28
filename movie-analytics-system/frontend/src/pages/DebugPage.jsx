import React, { useState } from "react";

// Hàm chuyển đổi bytes sang MB
const bytesToMB = (bytes) => {
  if (typeof bytes !== "number" || bytes === 0) return "0.00";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
};

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
            {result.collStats && (
              <div className="space-y-4">
                {/* Thông tin tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="text-2xl font-bold text-blue-700">
                      {result.collStats.count?.toLocaleString() || "N/A"}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Tổng số tài liệu (phim)
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="text-2xl font-bold text-green-700">
                      {bytesToMB(result.collStats.totalIndexSize)} MB
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Tổng dung lượng Index
                    </div>
                  </div>
                </div>

                {/* Chi tiết từng index */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">
                    Chi tiết dung lượng từng Index:
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Tên Index
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Dung lượng (MB)
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            % Tổng
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.collStats.indexSizes &&
                          Object.entries(result.collStats.indexSizes)
                            .sort(([, a], [, b]) => b - a) // Sắp xếp theo dung lượng giảm dần
                            .map(([indexName, size], index) => {
                              const percentage = (
                                (size / result.collStats.totalIndexSize) *
                                100
                              ).toFixed(1);
                              const isEven = index % 2 === 0;
                              return (
                                <tr
                                  key={indexName}
                                  className={isEven ? "bg-white" : "bg-gray-50"}
                                >
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">
                                      {indexName === "_id_" ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {indexName} (Mặc định)
                                        </span>
                                      ) : (
                                        <span className="text-gray-700">
                                          {indexName}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono text-lg">
                                    <span className="font-bold text-gray-900">
                                      {bytesToMB(size)}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">
                                      MB
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end">
                                      <div className="flex-1 max-w-20 mr-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">
                                        {percentage}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* JSON thô (có thể thu gọn) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                    📋 Xem dữ liệu JSON thô
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60 border">
                    {JSON.stringify(result.collStats, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
