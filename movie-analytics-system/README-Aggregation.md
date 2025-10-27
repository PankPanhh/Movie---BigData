# Demo: Sức mạnh của Aggregation Pipeline trong MongoDB

Tài liệu này giải thích về **Aggregation Pipeline** - một trong những tính năng mạnh mẽ nhất của MongoDB để xử lý và phân tích Big Data, và cách project này demo nó.

## 1. Aggregation Pipeline là gì?

**Aggregation Pipeline (Đường ống tổng hợp)** là một framework cho phép bạn xử lý dữ liệu qua một chuỗi các bước (stages). Mỗi stage sẽ nhận dữ liệu từ stage trước, thực hiện một thao tác (như lọc, nhóm, biến đổi), và chuyển kết quả cho stage tiếp theo.

Hãy tưởng tượng một dây chuyền lắp ráp trong nhà máy:

- Nguyên liệu thô (dữ liệu gốc) được đưa vào.
- Mỗi công đoạn (stage) thực hiện một nhiệm vụ chuyên biệt: cắt, gọt, lắp ráp...
- Cuối cùng, bạn nhận được một sản phẩm hoàn chỉnh (kết quả phân tích).

Đây là cách tiếp cận cực kỳ hiệu quả và linh hoạt để thực hiện các phân tích phức tạp ngay trên cơ sở dữ liệu, thay vì phải kéo hàng triệu bản ghi về phía ứng dụng để xử lý.

### Tại sao nó là "vũ khí" cho Big Data?

1.  **Xử lý phía Server**: Mọi tính toán đều diễn ra trên server MongoDB, tận dụng tối đa tài nguyên của server và giảm thiểu chi phí truyền tải dữ liệu qua mạng.
2.  **Hiệu suất cao**: Framework được tối ưu hóa để hoạt động trên các tập dữ liệu lớn, sử dụng index và các thuật toán nội bộ hiệu quả.
3.  **Phân tích phức tạp**: Cho phép thực hiện các tác vụ từ đơn giản (đếm, tính tổng) đến phức tạp (phân tích theo nhiều khía cạnh, tính toán theo nhóm, join dữ liệu) chỉ bằng một truy vấn duy nhất.
4.  **Real-time Analytics**: Khả năng xử lý nhanh giúp cung cấp các báo cáo và dashboard phân tích gần như thời gian thực.

---

## 2. Demo trong Project này

Trang **Analytics** (`/analytics`) được xây dựng để minh họa cách Aggregation Pipeline có thể biến dữ liệu thô thành những insight giá trị.

### Các kịch bản Demo và các "Stage" đã sử dụng:

#### a. Dashboard Tổng quan (`$facet`)

Đây là ví dụ điển hình nhất về sức mạnh của Aggregation. Chỉ với **một truy vấn duy nhất**, chúng ta có thể tạo ra nhiều báo cáo khác nhau. Stage `$facet` cho phép chạy song song nhiều pipeline con.

- **Pipeline con 1: Tổng quan**:
  - `$addFields` & `$convert`: Chuẩn hóa dữ liệu `year` (từ text có lỗi như "2014è" sang số) để tính toán chính xác.
  - `$group`: Tính tổng số phim, rating trung bình, năm cũ nhất/mới nhất.
- **Pipeline con 2: Top 5 thể loại**:
  - `$unwind`: Tách mảng `genres`.
  - `$group`: Đếm số phim theo từng thể loại.
  - `$sort` & `$limit`: Sắp xếp và lấy top 5.
- **Pipeline con 3: Phim theo thập kỷ**:
  - `$bucket`: Tự động phân loại phim vào các "xô" (thập kỷ) dựa trên năm sản xuất.
- **Pipeline con 4: Top phim mới có rating cao**:
  - `$match`: Lọc phim trong 10 năm gần nhất.
  - `$sort` & `$limit`: Sắp xếp theo rating và lấy top 5.

> **Điểm nhấn để thuyết trình**: "Với `$facet`, chúng ta không cần gọi 4 API khác nhau. Chỉ một lệnh duy nhất gửi đến MongoDB, và server sẽ trả về toàn bộ dữ liệu cần thiết cho dashboard. Điều này giúp giảm độ trễ mạng và đơn giản hóa code phía client."

#### b. Phân bố theo Thể loại (`$unwind`, `$group`)

- `$unwind: "$genres"`: "Mở" mảng `genres` ra, tạo một bản ghi riêng cho mỗi thể loại của một phim. Ví dụ: một phim có 2 thể loại sẽ trở thành 2 tài liệu.
- `$group`: Nhóm các tài liệu lại theo tên thể loại (`_id: "$genres"`) và thực hiện các phép tính:
  - `$sum: 1`: Đếm số phim trong mỗi nhóm.
  - `$avg: "$imdb.rating"`: Tính rating trung bình.
  - `$min: "$yearNum"`, `$max: "$yearNum"`: Tìm năm sản xuất cũ nhất và mới nhất.

> **Điểm nhấn để thuyết trình**: "Đây là một tác vụ phân tích kinh điển. Thay vì kéo hàng triệu bản ghi về và dùng vòng lặp để đếm, chúng ta để MongoDB làm việc đó. Kết quả trả về là một bảng tóm tắt nhỏ gọn, sẵn sàng để hiển thị."

#### c. Thống kê theo Năm (`$group`, `$sort`)

Tương tự như trên, nhưng nhóm theo trường `year`. Điều này cho thấy sự linh hoạt của pipeline - chỉ cần thay đổi trường trong `$group` là ta đã có một báo cáo hoàn toàn khác.

---

## 3. Vấn đề dữ liệu bẩn và cách xử lý

Trong quá trình làm demo, chúng ta phát hiện một số phim có năm sản xuất bị lỗi (ví dụ: `2014è`).

- **Vấn đề**: Khi tính toán `min`, `max` trên các giá trị chuỗi, kết quả sẽ không chính xác.
- **Giải pháp trong Pipeline**:
  - Sử dụng stage `$addFields` kết hợp với operator `$convert`.
  - `$convert: { input: "$year", to: "int", onError: null }`: Cố gắng chuyển đổi trường `year` sang kiểu số nguyên. Nếu thất bại (do có ký tự lạ), nó sẽ trả về `null`.
  - Sau đó, các stage sau (`$group`, `$match`) sẽ tính toán trên trường `yearNum` đã được làm sạch, đảm bảo kết quả luôn đúng.

> **Điểm nhấn để thuyết trình**: "Aggregation Pipeline không chỉ dùng để phân tích, mà còn là một công cụ mạnh mẽ để **làm sạch và chuẩn hóa dữ liệu (Data Cleansing & Normalization)** ngay trong lúc truy vấn. Điều này cực kỳ hữu ích khi làm việc với Big Data, nơi dữ liệu thường không đồng nhất."

## 4. Mã nguồn liên quan

- **Backend API**: Các route `/api/movies/analytics/*` trong `backend/routes/movieRoutes.js`.
- **Logic Aggregation**: Các hàm `get...` trong `backend/controllers/movieController.js`.
- **Frontend UI**: `frontend/src/pages/AnalyticsPage.jsx`.
