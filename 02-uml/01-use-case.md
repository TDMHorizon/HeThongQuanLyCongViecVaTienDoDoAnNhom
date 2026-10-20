# Danh sách Ca sử dụng (Use Case)

## 1. Bảng tổng hợp ca sử dụng
| Mã | Ca sử dụng | Tác tử chính | Mô tả tóm tắt |
|---|---|---|---|
| UC01 | Đăng nhập hệ thống | Tất cả tác tử | Người dùng xác thực thông tin tài khoản và mật khẩu vào hệ thống |
| UC02 | Đăng xuất hệ thống | Tất cả tác tử | Thoát khỏi phiên làm việc hiện tại |
| UC03 | Quản lý tài khoản người dùng | Quản trị viên | Thêm, sửa thông tin, khóa hoặc kích hoạt tài khoản |
| UC04 | Tạo và cập nhật đồ án | Giảng viên, Quản trị viên | Tạo mới, cập nhật thông tin môn học, mục tiêu đồ án |
| UC05 | Phân công nhóm và thành viên | Giảng viên, Quản trị viên | Thêm sinh viên vào nhóm, chỉ định 1 sinh viên làm Nhóm trưởng |
| UC06 | Thiết lập mốc tiến độ | Giảng viên, Nhóm trưởng | Thiết lập, điều chỉnh các mốc thời gian quan trọng của đồ án |
| UC07 | Giao việc cho Nhóm trưởng | Giảng viên | Giao các gói công việc / mục tiêu lớn kèm thời hạn cho nhóm |
| UC08 | Phân chia việc cho Thành viên | Nhóm trưởng | Chia nhỏ việc, phân công thành viên phụ trách và ấn định hạn chót |
| UC09 | Cập nhật tiến độ công việc | Thành viên, Nhóm trưởng, Giảng viên | Cập nhật % tiến độ thực tế, trạng thái thực hiện (Cần làm, Đang làm, Hoàn thành) |
| UC10 | Đánh giá và chốt tiến độ | Nhóm trưởng, Giảng viên | Kiểm tra kết quả, phê duyệt và khóa phần trăm tiến độ của công việc |
| UC11 | Xác nhận tiến độ tổng đồ án | Giảng viên, Nhóm trưởng | Tổng hợp dữ liệu các công việc để tính và chốt % tiến độ toàn đồ án |
| UC12 | Gửi bình luận và trao đổi | Giảng viên, Nhóm trưởng, Thành viên | Trao đổi phản hồi, thảo luận chi tiết bên dưới từng công việc |
| UC13 | Tải lên và quản lý tệp | Giảng viên, Nhóm trưởng, Thành viên | Tải lên biên bản, mã nguồn, báo cáo hoặc tải tài liệu tham khảo |
| UC14 | Tiếp nhận thông báo | Tất cả tác tử | Theo dõi danh sách thông báo công việc, hạn chót và phản hồi |
| UC15 | Gửi nhắc nhở trực tiếp | Giảng viên | Gửi nhắc nhở trực tiếp tới Nhóm trưởng hoặc Thành viên cụ thể |
| UC16 | Theo dõi bảng tiến độ | Giảng viên, Nhóm trưởng, Thành viên | Xem biểu đồ trực quan, tỷ lệ hoàn thành, số lượng việc quá hạn |
| UC17 | Tự động đánh dấu trễ hạn | Hệ thống | Định kỳ quét thời hạn, tự động chuyển trạng thái Trễ hạn và phát cảnh báo |

---

## 2. Đặc tả chi tiết các ca sử dụng cốt lõi

### UC01 — Đăng nhập hệ thống
- **Tác tử:** Quản trị viên, Giảng viên hướng dẫn, Nhóm trưởng, Thành viên.
- **Tiền điều kiện:** Tài khoản đã được tạo và đang ở trạng thái kích hoạt.
- **Luồng sự kiện chính:**
  1. Người dùng truy cập trang đăng nhập và nhập Email, Mật khẩu.
  2. Người dùng nhấn nút xác nhận "Đăng nhập".
  3. Hệ thống kiểm tra thông tin định danh và mật khẩu mã hóa.
  4. Hệ thống cấp quyền truy cập, ghi nhận phiên đăng nhập và điều hướng người dùng tới màn hình Bảng điều khiển phù hợp với vai trò.
- **Ngoại lệ:** Mật khẩu không chính xác hoặc tài khoản đang bị khóa -> Hệ thống hiển thị thông báo lỗi rõ ràng và yêu cầu nhập lại.
- **Hậu điều kiện:** Khởi tạo phiên làm việc hợp lệ cho người dùng.

### UC04 — Tạo và cập nhật đồ án
- **Tác tử:** Giảng viên hướng dẫn (với đồ án mình phụ trách), Quản trị viên.
- **Tiền điều kiện:** Đã đăng nhập vào hệ thống với quyền hạn hợp lệ.
- **Luồng sự kiện chính:**
  1. Người dùng chọn chức năng tạo mới hoặc chỉnh sửa đồ án.
  2. Nhập các thông tin: Tên đề tài đồ án, Loại đồ án (Đồ án môn học, Đồ án cơ sở, Đồ án chuyên ngành), Tên môn học, Mục tiêu cần đạt.
  3. Nhấn "Lưu thông tin".
  4. Hệ thống kiểm tra tính hợp lệ của dữ liệu, lưu đồ án và tự động tạo 1 nhóm sinh viên rỗng gắn trực tiếp với đồ án này (quan hệ 1–1).
- **Hậu điều kiện:** Bản ghi đồ án và nhóm tương ứng được tạo lập thành công.

### UC05 — Phân công nhóm và thành viên
- **Tác tử:** Giảng viên hướng dẫn, Quản trị viên.
- **Luồng sự kiện chính:**
  1. Người dùng chọn đồ án cần phân công nhóm.
  2. Tìm kiếm và thêm các sinh viên tham gia đồ án.
  3. Chỉ định chính xác 1 sinh viên đảm nhận vai trò **Nhóm trưởng**, các sinh viên còn lại là **Thành viên**.
  4. Nhấn "Lưu danh sách nhóm". Hệ thống lưu trữ thông tin thành viên và gửi thông báo mời tham gia tới từng sinh viên.
- **Ràng buộc nghiệp vụ:** Mỗi đồ án nhóm bắt buộc phải có đúng một Nhóm trưởng.

### UC07 — Giao việc cho Nhóm trưởng
- **Tác tử:** Giảng viên hướng dẫn.
- **Luồng sự kiện chính:**
  1. Giảng viên vào không gian đồ án, chọn tạo công việc mới.
  2. Nhập tiêu đề công việc, mô tả yêu cầu, hạn chót hoàn thành và gán cho Nhóm trưởng.
  3. Chọn mốc tiến độ (Milestone) tương ứng của đồ án mà công việc trực thuộc (Bắt buộc).
  4. Nhấn "Giao việc". Hệ thống lưu công việc và gửi thông báo nhắc việc đến Nhóm trưởng.
- **Hậu điều kiện:** Công việc xuất hiện trong danh sách việc của đồ án, Nhóm trưởng nhận thông báo.

### UC08 — Phân chia việc cho Thành viên
- **Tác tử:** Nhóm trưởng.
- **Luồng sự kiện chính:**
  1. Nhóm trưởng xem công việc do Giảng viên giao hoặc các đầu mục việc trong đồ án.
  2. Tạo các công việc cụ thể, chọn mốc tiến độ trực thuộc và mô tả chi tiết nội dung cần làm.
  3. Chọn Thành viên thực hiện trong nhóm và ấn định hạn chót cụ thể.
  4. Nhấn "Lưu và phân công". Hệ thống tạo bản ghi công việc và gửi thông báo trực tiếp đến Thành viên được giao.
- **Hậu điều kiện:** Thành viên thấy công việc trong danh sách "Công việc của tôi".

### UC09 — Cập nhật tiến độ công việc
- **Tác tử:** Thành viên được giao việc, Nhóm trưởng, Giảng viên.
- **Luồng sự kiện chính:**
  1. Người dùng mở chi tiết công việc.
  2. Điều chỉnh trạng thái (Cần làm / Đang làm / Hoàn thành) và kéo tỷ lệ phần trăm tiến độ hoàn thành (từ 0% đến 100%).
  3. Nhấn "Cập nhật". Hệ thống ghi nhận tiến độ mới và thông báo đến Nhóm trưởng và Giảng viên.
- **Ngoại lệ:** Nếu công việc đã bị **Khóa tiến độ** (đã được chốt bởi Nhóm trưởng hoặc Giảng viên), người thực hiện không được tự ý sửa % tiến độ trừ khi được mở khóa.

### UC10 — Đánh giá và chốt tiến độ
- **Tác tử:** Nhóm trưởng, Giảng viên hướng dẫn.
- **Luồng sự kiện chính:**
  1. Người phụ trách mở công việc cần duyệt tiến độ.
  2. Kiểm tra kết quả thực hiện, sản phẩm và tiến độ tự đánh giá của sinh viên.
  3. Chọn chức năng "Chốt tiến độ".
  4. Hệ thống ghi nhận trạng thái khóa (`trang_thai_khoa = True`), lưu người duyệt và gửi thông báo xác nhận đến Thành viên.
- **Hậu điều kiện:** Công việc được khóa tiến độ, đảm bảo tính minh bạch và chính xác của số liệu.

### UC15 — Gửi nhắc nhở trực tiếp
- **Tác tử:** Giảng viên hướng dẫn.
- **Luồng sự kiện chính:**
  1. Giảng viên xem tiến độ đồ án, phát hiện dấu hiệu chậm trễ.
  2. Chọn Nhóm trưởng hoặc sinh viên cụ thể trong nhóm đồ án.
  3. Soạn nội dung nhắc nhở, thúc đẩy công việc và nhấn "Gửi nhắc nhở".
  4. Hệ thống lập tức tạo bản ghi thông báo ưu tiên trong hộp thư thông báo của sinh viên đó.

### UC16 — Theo dõi bảng tiến độ
- **Tác tử:** Giảng viên hướng dẫn, Nhóm trưởng, Thành viên.
- **Luồng sự kiện chính:**
  1. Người dùng truy cập vào trang Bảng điều khiển của đồ án.
  2. Hệ thống tổng hợp số liệu: Phần trăm tiến độ tổng thể, số lượng công việc theo từng trạng thái (Cần làm, Đang làm, Hoàn thành, Trễ hạn), danh sách các công việc sắp đến hạn hoặc quá hạn.
  3. Hiển thị dưới dạng biểu đồ cột, biểu đồ tròn và danh sách trực quan.

### UC17 — Tự động đánh dấu trễ hạn
- **Tác tử:** Hệ thống (tiến trình tự động chạy ngầm theo lịch trình).
- **Luồng sự kiện chính:**
  1. Hệ thống tự động quét danh sách công việc trên toàn hệ thống.
  2. So sánh thời điểm hiện tại với hạn chót của từng công việc.
  3. Đối với các công việc chưa hoàn thành mà đã quá hạn chót, hệ thống tự động cập nhật trạng thái thành "Trễ hạn".
  4. Hệ thống phát sinh thông báo cảnh báo gửi tới sinh viên phụ trách và Nhóm trưởng.
