# Thông tin nghiệp vụ đã chốt (Cổng 0)

> Nguồn sự thật cho toàn bộ đặc tả / UML / CSDL. Không được mâu thuẫn với file này khi viết tài liệu khác.

## 1. Hành chính
- **Đề tài:** Hệ thống quản lý công việc và tiến độ đồ án nhóm
- **Ngành:** Công nghệ thông tin
- **Chuyên ngành:** Công nghệ phần mềm
- **SV:** Đỗ Minh Trực (2180606023 – 21DTHC5), Trần Minh Duy (2280600494 – 22DTHE9)
- **GVHD:** ThS. Bùi Phú Khuyên
- **Stack:** React, Node.js (Express), PostgreSQL/SQL, Chart.js hoặc ECharts
- **Triển khai MVP:** chỉ **local** (không bắt buộc Cloudflare/Render/Supabase)

## 2. Actor & quyền
| Vai trò | Quyền chính |
|---|---|
| Admin | Quản trị hệ thống, tài khoản demo, cấu hình chung |
| GVHD | CRUD cao nhất trên đồ án phụ trách; giao việc/mục tiêu xuống nhóm trưởng; nhắc trực tiếp SV & NT; theo dõi/chốt tiến độ |
| Nhóm trưởng (NT) | CRUD trong nhóm; nhận việc từ GVHD; phân việc cho thành viên; chốt % task |
| Thành viên (TV) | Nhận việc; cập nhật % task được giao; bình luận / file trên task được giao |

## 3. Mô hình Đồ án – Nhóm
- Tách khái niệm **Đồ án (Project)** và **Nhóm (Group)**
- MVP: **1 đồ án = 1 nhóm**
- Một SV có thể thuộc nhiều đồ án
- Loại đồ án:
  - **Đồ án môn học:** mỗi môn 1 đồ án
  - **Đồ án cơ sở:** mỗi SV chỉ 1
  - **Đồ án chuyên ngành:** mỗi SV chỉ 1; điều kiện nghiệp vụ: đã qua ĐACS (validate mức ứng dụng, có thể soft-check)

## 4. Mục đích & thông báo
- Theo dõi / thông báo tiến độ
- Thông báo khi có việc được phân công
- Nhắc khi sắp đến hạn / đến hạn / trễ hạn
- Luồng giao việc chính: **GVHD → NT → TV**
- GVHD có thể **nhắc / thông báo trực tiếp** tới NT và TV

## 5. Task, milestone, tiến độ
- Có **milestone**, **bình luận**, **file đính kèm**
- Trạng thái task: `Todo` | `Doing` | `Done` | `Overdue` (Trễ hạn)
- Deadline khi task được giao kèm thời hạn
- % task: TV và NT cập nhật được; có bước **chốt % cuối** bởi NT hoặc GVHD
- % tổng đồ án: bám mục tiêu công việc; tính dần khi giao thêm việc; GVHD/NT có thể xác nhận % tổng

## 6. MVP bắt buộc
1. Auth + phân quyền 4 vai
2. Quản lý đồ án (kèm loại)
3. Quản lý nhóm / thành viên / nhóm trưởng (1–1 với đồ án)
4. Milestone cơ bản
5. Task + deadline + trạng thái có Trễ hạn; luồng GVHD→NT→TV
6. % task + chốt % cuối
7. % tổng đồ án
8. Bình luận trên task
9. File đính kèm trên task
10. Thông báo inbox (không bắt buộc email thật)
11. Dashboard tiến độ + biểu đồ

## 7. Ngoài phạm vi kỳ này
- Email / Push notification thật
- AI chia việc
- Mobile native
- Tích hợp GitHub
- Workflow khoa / học kỳ phức tạp
- Deploy online (để hướng phát triển)

## 8. Hướng phát triển
- Email remind thật
- Gantt / lịch tuần
- Tiêu chí đánh giá của GVHD
- Nộp tài liệu lên cổng khoa
- Deploy online

## 9. Kịch bản demo bảo vệ (local)
1. Admin đăng nhập, chỉ phân quyền
2. GVHD tạo đồ án + chỉ định nhóm trưởng
3. GVHD giao milestone / việc xuống NT
4. NT phân task cho TV (có deadline)
5. TV nhận việc, cập nhật %, bình luận, đính kèm file
6. NT chốt % task → dashboard + thông báo cập nhật
7. Demo trạng thái Trễ hạn + thông báo nhắc
