# Demo: Tối ưu hóa Truy vấn với Index trong MongoDB

Tài liệu này giải thích tầm quan trọng của **Indexing** trong việc xử lý Big Data và cách project này demo sức mạnh của nó.

## 1. Index là gì và tại sao nó quan trọng?

Hãy tưởng tượng bạn cần tìm một chủ đề trong một cuốn sách dày 1000 trang không có mục lục. Bạn sẽ phải lật từng trang một cho đến khi tìm thấy. Đây gọi là **Full Collection Scan** trong cơ sở dữ liệu. Quá trình này cực kỳ chậm và tốn tài nguyên, đặc biệt với hàng triệu hoặc hàng tỷ bản ghi (Big Data).

**Index (chỉ mục)** hoạt động giống như mục lục của cuốn sách. Thay vì quét toàn bộ dữ liệu, MongoDB sẽ tra cứu trong index, nơi các giá trị đã được sắp xếp và có con trỏ trỏ thẳng đến vị trí của dữ liệu gốc.

### Lợi ích chính khi xử lý Big Data:

1.  **Tốc độ truy vấn siêu nhanh**: Giảm thời gian phản hồi từ vài giây (hoặc phút) xuống còn vài mili giây.
2.  **Giảm tải cho Server**: Giảm đáng kể việc sử dụng CPU và I/O (đọc/ghi đĩa), giúp hệ thống hoạt động ổn định hơn.
3.  **Khả năng mở rộng (Scalability)**: Khi dữ liệu tăng lên, truy vấn không có index sẽ chậm đi theo cấp số nhân, trong khi truy vấn có index vẫn duy trì hiệu suất cao.

---

## 2. Demo trong Project này

Trang **Debug** (`/debug`) được thiết kế để so sánh trực quan hiệu suất truy vấn **TRƯỚC** và **SAU** khi tạo index.

### Kịch bản Demo:

- **Truy vấn mẫu**: Tìm các phim thuộc thể loại `Action` sản xuất từ năm `2010` trở đi.
  ```json
  { "genres": "Action", "year": { "$gte": 2010 } }
  ```
- **Index được tạo**: Một **compound index (chỉ mục phức hợp)** trên hai trường `genres` và `year`.
  ```json
  { "genres": 1, "year": -1 }
  ```
  - `genres: 1`: Sắp xếp thể loại theo thứ tự tăng dần.
  - `year: -1`: Sắp xếp năm theo thứ tự giảm dần trong mỗi thể loại.
  - Thứ tự các trường trong index rất quan trọng, nó phải khớp với thứ tự của truy vấn (đầu tiên lọc theo `genres`, sau đó lọc theo `year`).

### Cách thực hiện Demo:

1.  Truy cập trang **Debug**.
2.  Nhập các tham số truy vấn (ví dụ: `genre=Action`, `minYear=2010`).
3.  Nhấn nút **"Chạy So sánh"**.
4.  Quan sát kết quả ở hai cột "TRƯỚC KHI TẠO INDEX" và "SAU KHI TẠO INDEX".

### Phân tích kết quả:

#### Cột "TRƯỚC KHI TẠO INDEX"

Đây là kịch bản tồi tệ nhất. MongoDB phải quét toàn bộ collection.

- **Kế hoạch thực thi (`explain` plan)**:
  - **`stage`: `COLLSCAN`** (Collection Scan): Đây là dấu hiệu rõ ràng nhất của một truy vấn không hiệu quả. MongoDB đã phải duyệt qua TẤT CẢ các tài liệu.
- **Các chỉ số quan trọng**:
  - `totalDocsExamined`: Số tài liệu đã quét. Con số này sẽ rất lớn, gần bằng tổng số tài liệu trong collection.
  - `executionTimeMillis`: Thời gian thực thi truy vấn (tính bằng mili giây). Con số này sẽ tương đối cao.
  - `Median Runtime`: Thời gian chạy trung vị sau nhiều lần thực thi. Đây là con số thực tế mà người dùng cảm nhận được.

#### Cột "SAU KHI TẠO INDEX"

Sau khi index `{ "genres": 1, "year": -1 }` được tạo, hiệu suất thay đổi một cách đột phá.

- **Kế hoạch thực thi (`explain` plan)**:
  - **`stage`: `IXSCAN`** (Index Scan): MongoDB đã sử dụng index để tìm kiếm. Nó chỉ quét các khóa trong index, không phải toàn bộ tài liệu.
- **Các chỉ số quan trọng**:
  - `totalKeysExamined`: Số lượng khóa trong index đã được quét.
  - `totalDocsExamined`: Số tài liệu đã quét. Con số này sẽ giảm mạnh, chỉ bằng số tài liệu thực sự khớp với điều kiện.
  - `executionTimeMillis`: Thời gian thực thi giảm xuống đáng kể.
  - `Median Runtime`: Thời gian chạy trung vị giảm mạnh, cho thấy truy vấn nhanh hơn rất nhiều.

### Kết luận cho buổi thuyết trình:

> "Như các bạn thấy, trước khi có index, để tìm phim Action từ năm 2010, hệ thống phải quét qua **X** triệu tài liệu, mất **Y** mili giây. Nhưng chỉ với một thao tác tạo index đơn giản, cũng với truy vấn đó, hệ thống chỉ cần quét **Z** tài liệu và hoàn thành trong **W** mili giây - nhanh hơn hàng trăm, thậm chí hàng nghìn lần. Đây chính là sức mạnh của indexing khi làm việc với Big Data, giúp đảm bảo hiệu suất và khả năng đáp ứng của ứng dụng."

---

## 3. Mã nguồn liên quan

- **Backend API**: `GET /api/debug/compare-index` trong `backend/controllers/debugController.js`.
- **Frontend UI**: `frontend/src/pages/DebugPage.jsx`.
- **Logic tạo/xóa index và đo lường**: Được thực hiện trong hàm `compareIndex` của `debugController.js`.
