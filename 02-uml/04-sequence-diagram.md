# Sơ đồ Tuần tự (Sequence Diagrams)

> **Cách xem sơ đồ:** Xem trên giao diện GitHub hoặc sao chép mã dán vào trang [Mermaid Live Editor](https://mermaid.live).  
> **Quy chuẩn thiết kế:** Toàn bộ thông điệp (Messages) giữa các đối tượng trong sơ đồ tuần tự đều sử dụng **Động từ hành động** (Action Verbs).

---

## 1. Quy trình Đăng nhập hệ thống

```mermaid
sequenceDiagram
  participant ND as Người dùng
  participant GD as Giao diện Web (Frontend)
  participant MC as Máy chủ API (Backend)
  participant CSDL as Cơ sở dữ liệu (Database)

  ND->>GD: Nhập thông tin Email và Mật khẩu
  GD->>MC: Gửi yêu cầu đăng nhập (POST /api/auth/login)
  MC->>CSDL: Truy vấn thông tin người dùng theo Email
  CSDL-->>MC: Trả về bản ghi người dùng và mã băm mật khẩu
  MC->>MC: So sánh mã băm mật khẩu và kiểm tra trạng thái
  MC-->>GD: Cấp mã phiên làm việc (JWT Token) và thông tin tài khoản
  GD-->>ND: Điều hướng tới Bảng điều khiển theo vai trò
```

---

## 2. Quy trình Giảng viên giao việc cho Nhóm trưởng

```mermaid
sequenceDiagram
  participant GV as Giảng viên hướng dẫn
  participant GD as Giao diện Web (Frontend)
  participant MC as Máy chủ API (Backend)
  participant CSDL as Cơ sở dữ liệu (Database)

  GV->>GD: Soạn tiêu đề việc, mô tả, chọn Nhóm trưởng và hạn chót
  GD->>MC: Gửi yêu cầu tạo công việc (POST /api/projects/:id/tasks)
  MC->>MC: Xác thực quyền Giảng viên hướng dẫn của đồ án
  MC->>CSDL: Lưu bản ghi công việc mới vào bảng công việc
  MC->>CSDL: Tạo bản ghi thông báo việc mới cho Nhóm trưởng
  CSDL-->>MC: Xác nhận lưu thành công
  MC-->>GD: Phản hồi kết quả tạo công việc
  GD-->>GV: Hiển thị công việc mới trên màn hình
```

---

## 3. Quy trình Phân việc, Cập nhật tiến độ và Chốt tiến độ công việc

```mermaid
sequenceDiagram
  participant NT as Nhóm trưởng
  participant TV as Thành viên thực hiện
  participant GD as Giao diện Web (Frontend)
  participant MC as Máy chủ API (Backend)
  participant CSDL as Cơ sở dữ liệu (Database)

  Note over NT,CSDL: Giai đoạn 1: Phân chia công việc cho thành viên
  NT->>GD: Phân chia công việc cụ thể cho Thành viên kèm thời hạn
  GD->>MC: Gửi yêu cầu phân công (POST /api/tasks/:id/assign)
  MC->>CSDL: Ghi nhận phân công và tạo thông báo cho Thành viên
  MC-->>GD: Xác nhận phân công thành công

  Note over TV,CSDL: Giai đoạn 2: Thành viên cập nhật tiến độ thực tế
  TV->>GD: Cập nhật tiến độ 70% và trạng thái "Đang thực hiện"
  GD->>MC: Gửi dữ liệu cập nhật (PATCH /api/tasks/:id/progress)
  MC->>CSDL: Kiểm tra trạng thái khóa và cập nhật % tiến độ
  MC->>CSDL: Tạo thông báo gửi Nhóm trưởng và Giảng viên
  MC-->>GD: Xác nhận cập nhật thành công

  Note over NT,CSDL: Giai đoạn 3: Nhóm trưởng kiểm tra và chốt tiến độ
  NT->>GD: Kiểm tra kết quả hoàn thành và nhấn "Chốt tiến độ"
  GD->>MC: Gửi yêu cầu chốt và khóa tiến độ (POST /api/tasks/:id/lock-progress)
  MC->>CSDL: Cập nhật thuộc tính trạng thái khóa = True (trang_thai_khoa)
  MC->>CSDL: Tạo thông báo gửi Thành viên xác nhận chốt
  MC-->>GD: Phản hồi trạng thái đã khóa bảo vệ
```

---

## 4. Quy trình Tổng hợp và Hiển thị Bảng điều khiển tiến độ (Dashboard)

```mermaid
sequenceDiagram
  participant ND as Người dùng (GV/NT/TV)
  participant GD as Giao diện Web (Frontend)
  participant MC as Máy chủ API (Backend)
  participant CSDL as Cơ sở dữ liệu (Database)

  ND->>GD: Yêu cầu mở Bảng theo dõi tiến độ đồ án
  GD->>MC: Gửi yêu cầu lấy số liệu thống kê (GET /api/projects/:id/dashboard)
  MC->>CSDL: Thống kê số lượng công việc theo từng trạng thái
  MC->>CSDL: Tính toán tỷ lệ % tiến độ tổng và đếm số việc trễ hạn
  CSDL-->>MC: Trả về kết quả truy vấn số liệu
  MC-->>GD: Phản hồi gói dữ liệu JSON tổng hợp
  GD-->>ND: Vẽ biểu đồ trực quan và hiển thị số liệu thống kê
```
