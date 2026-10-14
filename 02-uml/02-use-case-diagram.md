# Sơ đồ Ca sử dụng (Use Case Diagram)

> **Cách xem sơ đồ:** Xem trực tiếp trên giao diện GitHub hoặc sao chép nội dung trong khối mã dán vào trang [Mermaid Live Editor](https://mermaid.live).  
> **Quy chuẩn thiết kế:** Tên tất cả các ca sử dụng (Use Case) trong sơ đồ đều bắt đầu bằng **Động từ hành động** (Action Verb) đại diện cho chức năng của hệ thống.

```mermaid
flowchart LR
  Admin(("Quản trị viên"))
  GVHD(("Giảng viên hướng dẫn"))
  NT(("Nhóm trưởng"))
  TV(("Thành viên"))
  SYS(("Hệ thống tự động"))

  Admin --> UC03["UC03: Quản lý tài khoản"]
  Admin --> UC04["UC04: Tạo và cập nhật đồ án"]
  Admin --> UC05["UC05: Phân công nhóm và thành viên"]

  GVHD --> UC01["UC01: Đăng nhập hệ thống"]
  GVHD --> UC04
  GVHD --> UC05
  GVHD --> UC06["UC06: Thiết lập mốc tiến độ"]
  GVHD --> UC07["UC07: Giao việc cho Nhóm trưởng"]
  GVHD --> UC09["UC09: Cập nhật tiến độ công việc"]
  GVHD --> UC10["UC10: Đánh giá và chốt tiến độ"]
  GVHD --> UC11["UC11: Xác nhận tiến độ tổng đồ án"]
  GVHD --> UC12["UC12: Gửi bình luận và trao đổi"]
  GVHD --> UC13["UC13: Tải lên và quản lý tệp"]
  GVHD --> UC14["UC14: Tiếp nhận thông báo"]
  GVHD --> UC15["UC15: Gửi nhắc nhở trực tiếp"]
  GVHD --> UC16["UC16: Theo dõi bảng tiến độ"]

  NT --> UC01
  NT --> UC06
  NT --> UC08["UC08: Phân chia việc cho Thành viên"]
  NT --> UC09
  NT --> UC10
  NT --> UC11
  NT --> UC12
  NT --> UC13
  NT --> UC14
  NT --> UC16

  TV --> UC01
  TV --> UC09
  TV --> UC12
  TV --> UC13
  TV --> UC14
  TV --> UC16

  SYS --> UC17["UC17: Tự động đánh dấu trễ hạn"]
```

## Ghi chú kỹ thuật
- **UC02 (Đăng xuất hệ thống):** Là hành động áp dụng chung cho tất cả các tác tử sau khi đã đăng nhập thành công (được ẩn bớt đường nối trên sơ đồ để tránh rối mắt).
- Sinh viên có thể xuất sơ đồ sang dạng hình ảnh (.PNG/.SVG) hoặc vẽ lại trên StarUML/Draw.io để đưa vào tài liệu báo cáo Word Đồ án cơ sở.
