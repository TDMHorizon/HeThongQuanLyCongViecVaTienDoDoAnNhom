# Sơ đồ Hoạt động (Activity Diagrams)

> **Cách xem sơ đồ:** Xem trên giao diện GitHub hoặc sao chép mã dán vào trang [Mermaid Live Editor](https://mermaid.live).  
> **Quy chuẩn thiết kế:** Toàn bộ các nút hành động (Action / Activity Nodes) trong sơ đồ hoạt động đều bắt đầu bằng **Động từ hành động** (Action Verbs).

---

## 1. Quy trình tạo, thực hiện và hoàn thành một công việc trong nhóm

```mermaid
flowchart TD
  Start([Bắt đầu]) --> GVHD_Giao[Giao mục tiêu công việc cho Nhóm trưởng]
  GVHD_Giao --> NT_Nhan[Tiếp nhận công việc và xem yêu cầu]
  NT_Nhan --> NT_Phan[Chia nhỏ việc và phân công cho Thành viên kèm thời hạn]
  NT_Phan --> ThongBaoTV[Gửi thông báo phân công đến Thành viên]
  ThongBaoTV --> TV_Lam[Thực hiện công việc và cập nhật % tiến độ thực tế]
  TV_Lam --> CoTraoDoi{Có cần trao đổi hoặc đính kèm tệp?}
  CoTraoDoi -->|Có| ThemDinhKem[Gửi bình luận trao đổi hoặc tải lên tệp tài liệu]
  CoTraoDoi -->|Không| KiemTraHan{Kiểm tra quá thời hạn chưa hoàn thành?}
  ThemDinhKem --> KiemTraHan
  KiemTraHan -->|Có| DanhDauTre[Chuyển trạng thái sang Trễ hạn và phát cảnh báo]
  KiemTraHan -->|Không| DanhGiaTienDo[Kiểm tra kết quả và đánh giá tiến độ]
  DanhDauTre --> DanhGiaTienDo
  DanhGiaTienDo --> DatYeuCau{Đạt yêu cầu nghiệm thu?}
  DatYeuCau -->|Chưa đạt| TV_Lam
  DatYeuCau -->|Đạt yêu cầu| ChotTienDo[Phê duyệt và chốt tiến độ công việc]
  ChotTienDo --> KetThucTask([Kết thúc công việc])
```

---

## 2. Quy trình theo dõi và quản lý tiến độ tổng thể đồ án

```mermaid
flowchart TD
  BatDauDoAn([Bắt đầu kỳ đồ án]) --> TaoDoAn[Khởi tạo đề tài đồ án và nhóm sinh viên tương ứng]
  TaoDoAn --> ChiDinhNhom[Thêm sinh viên và chỉ định Nhóm trưởng]
  ChiDinhNhom --> ThietLapMoc[Thiết lập các mốc tiến độ chính của đồ án]
  PhanCongTheoCap[Giao việc theo phân cấp: Giảng viên -> Nhóm trưởng -> Thành viên]
  ThietLapMoc --> PhanCongTheoCap
  PhanCongTheoCap --> CapNhatVaChot[Thực hiện công việc, cập nhật và chốt tiến độ]
  CapNhatVaChot --> TinhTienDoTong[Tính toán và cập nhật tỷ lệ % tiến độ tổng thể]
  TinhTienDoTong --> HienThiDashboard[Hiển thị Bảng điều khiển tiến độ và phát thông báo]
  HienThiDashboard --> KiemTraConViec{Kiểm tra còn công việc hoặc mốc tiếp theo?}
  KiemTraConViec -->|Còn việc| PhanCongTheoCap
  KiemTraConViec -->|Đã hoàn tất| KetThucDoAn([Nghiệm thu và kết thúc đồ án])
```
