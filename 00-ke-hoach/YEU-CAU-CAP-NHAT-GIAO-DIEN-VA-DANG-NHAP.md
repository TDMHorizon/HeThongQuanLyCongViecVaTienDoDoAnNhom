# Kế Hoạch & Đặc Tả Cập Nhật Tính Năng: Đăng Nhập & Hiển Thị Thời Gian Thẻ Công Việc

> **Thời gian ghi nhận:** 18/11/2026  
> **Nguồn gốc:** Phản hồi trực tiếp từ bản vẽ tay trên giao diện hệ thống Quản lý đồ án nhóm.  
> **Trạng thái:** Chờ xác nhận để tiến hành lập trình.

---

## 1. Bối cảnh & Mục đích

Dựa trên hình ảnh chụp màn hình giao diện kèm ghi chú trực quan, hệ thống cần được bổ sung 2 nội dung chính trước khi hoàn thiện mã nguồn:
1. **Bổ sung chức năng Đăng nhập (Authentication):** Thay thế thanh chuyển đổi vai trò nhanh trên cùng bằng một quy trình đăng nhập, lưu phiên làm việc và đăng xuất chuẩn mực.
2. **Hiển thị thời gian trên thẻ Kanban (Task Card Due Date):** Hiển thị trực quan thông tin ngày hạn chót/thời gian làm việc trực tiếp trên từng card công việc ở bảng Kanban.

---

## 2. Chi tiết yêu cầu 1: Chức năng Đăng nhập (Authentication)

### 2.1. Hiện trạng
* Hiện tại hệ thống đang sử dụng thanh điều hướng `BannerRoleBar.jsx` với 3 nút bấm tĩnh để chuyển đổi qua lại giữa:
  * **ThS. Bùi Phú Khuyên** (`u-gv-01` - GVHD)
  * **Đỗ Minh Trực** (`u-sv-01` - Nhóm trưởng)
  * **Trần Minh Duy** (`u-sv-02` - Thành viên)
* Việc chuyển đổi này chỉ mang tính chất minh họa kịch bản demo, chưa có cơ chế đăng nhập, bảo vệ phiên đăng nhập hoặc kiểm tra mật khẩu.

### 2.2. Giải pháp thực hiện
* **Màn hình Đăng nhập (Login View / Modal):**
  * Giao diện đăng nhập thân thiện, đồng bộ với phong cách thiết kế của hệ thống.
  * Form nhập liệu: **Email trường** (`@huflit.edu.vn`) và **Mật khẩu**.
  * **Hỗ trợ chọn nhanh tài khoản demo (Quick Login):** Cung cấp sẵn 3 nút chọn nhanh tài khoản (GVHD, Nhóm trưởng, Thành viên) để giảng viên và sinh viên tiện báo cáo đồ án mà không mất công gõ tay từng lần.
* **Xử lý phiên đăng nhập (Session/Auth State):**
  * Lưu trạng thái người dùng đang đăng nhập vào LocalStorage hoặc React Context.
  * Kiểm tra quyền hạn tương ứng:
    * **Giảng viên:** Xem tổng thể, đánh giá mốc tiến độ, khóa tiến độ.
    * **Nhóm trưởng:** Quản lý thành viên, phân chia công việc, tự chấm và phê duyệt tiến độ.
    * **Thành viên:** Tự chấm công việc của bản thân, nộp tệp đính kèm và gửi bình luận.
* **Header & Nút Đăng xuất (Logout):**
  * Hiển thị Avatar, tên và vai trò của người dùng đang đăng nhập ở góc trên bên phải.
  * Thêm nút **Đăng xuất** để quay về màn hình đăng nhập hoặc đổi tài khoản khác.
* **Cơ sở dữ liệu & API Backend:**
  * Khai thác trực tiếp bảng `nguoi_dung` đã có trong CSDL SQLite:
    * `email`, `mat_khau_bam`, `ho_ten`, `vai_tro_he_thong`.
  * Viết thêm Endpoint API đăng nhập:
    * `POST /api/auth/login` (nhận email + mật khẩu, trả về thông tin người dùng và token/session).
    * `GET /api/auth/me` (lấy thông tin người dùng hiện tại).

---

## 3. Chi tiết yêu cầu 2: Hiển thị thời gian trên Thẻ công việc (Kanban Task Card)

### 3.1. Hiện trạng
* Trên các cột Kanban (*Cần làm*, *Đang làm*, *Hoàn thành*, *Trễ hạn*), mỗi thẻ công việc hiện có:
  * Tiêu đề công việc.
  * Tên mốc tiến độ (Milestone tag).
  * Nút tự chấm % nhanh (`25%`, `50%`, `75%`, `100%`).
  * Avatar & tên viết tắt người thực hiện.
  * Thanh tiến độ và số %.
* **Thiếu sót:** Người dùng không nhìn thấy hạn chót (`han_chot`) của công việc ngay trên mặt thẻ, phải bấm vào xem chi tiết trong ngăn trượt (Drawer) mới thấy.

### 3.2. Giải pháp thực hiện
* **Dữ liệu có sẵn:** Bảng `cong_viec` trong CSDL SQLite và dữ liệu mẫu đã có sẵn trường `han_chot` (ví dụ: `2026-10-25`, `2026-11-20`).
* **Hiển thị trực quan trên thẻ:**
  * Đặt một dòng / huy hiệu (badge) thời gian ngay cạnh thông tin mốc tiến độ hoặc phía trên thanh tiến độ:
    * Biểu tượng lịch 📅 kèm định dạng ngày thân thiện: `Hạn: 25/10/2026` hoặc `20 Th11, 2026`.
  * **Trạng thái màu sắc theo thời hạn:**
    * **Quá hạn:** Màu đỏ cảnh báo (kèm icon ngọn lửa 🔥 hoặc sticker trễ hạn).
    * **Sắp đến hạn (còn <= 2 ngày):** Màu cam cảnh báo.
    * **Bình thường / Đang trong hạn:** Màu xám / xanh nhẹ trung tính.
    * **Đã hoàn thành:** Màu xanh lá cây.

---

## 4. Kế hoạch triển khai kỹ thuật (Checklist)

| STT | Hạng mục | Tệp tin liên quan | Mô tả công việc |
|:---:|---|---|---|
| 1 | **Backend API Auth** | `07-nguon-code/demo-giao-dien/server.js` | Thêm route đăng nhập `/api/auth/login` kiểm tra bảng `nguoi_dung`. |
| 2 | **Giao diện Đăng nhập** | `src/components/LoginModal.jsx` (hoặc `LoginScreen.jsx`) | Xây dựng form đăng nhập kèm nút chọn nhanh 3 tài khoản demo. |
| 3 | **Cập nhật Header** | `src/components/Header.jsx` & `BannerRoleBar.jsx` | Thêm thông tin User đang đăng nhập + nút Đăng xuất. |
| 4 | **Bổ sung thời gian Card** | `src/components/KanbanBoard.jsx` | Render nhãn hạn chót `han_chot` và badge cảnh báo ngày hết hạn. |
| 5 | **Style CSS** | `src/styles/app.css` | Thêm định dạng thẻ ngày hạn chót và giao diện đăng nhập tinh tế. |

---

## 5. Ghi chú xác nhận
Tài liệu này được lưu tại: [00-ke-hoach/YEU-CAU-CAP-NHAT-GIAO-DIEN-VA-DANG-NHAP.md](file:///e:/HeThongQuanLyCongViecVaTienDoDoAnNhom/00-ke-hoach/YEU-CAU-CAP-NHAT-GIAO-DIEN-VA-DANG-NHAP.md).  
Khi bạn duyệt nội dung này, chúng ta sẽ bắt đầu triển khai code theo đúng từng bước trên.

