# Hệ thống quản lý công việc và tiến độ đồ án nhóm

Đồ án cơ sở — Chuyên ngành Công nghệ phần mềm.

## Thông tin
| Hạng mục | Nội dung |
|---|---|
| Đề tài | Hệ thống quản lý công việc và tiến độ đồ án nhóm |
| Ngành | Công nghệ thông tin |
| Chuyên ngành | Công nghệ phần mềm |
| Sinh viên | Đỗ Minh Trực (2180606023 – 21DTHC5), Trần Minh Duy (2280600494 – 22DTHE9) |
| GVHD | ThS. Bùi Phú Khuyên |
| Stack công nghệ | Frontend: React 19 + Vite | Backend: Node.js (REST API) | CSDL: SQLite (Engine cục bộ 9 bảng BCNF) / PostgreSQL (Thiết kế DDL) |
| Triển khai | Localhost (Port 4173 & 5173) |

## Cấu trúc dự án
- `00-ke-hoach/` — Kế hoạch tổng thể và các biên bản hướng dẫn
- `01-dac-ta/` — Đặc tả yêu cầu chức năng (FR) và phi chức năng (NFR)
- `02-uml/` — Sơ đồ Use Case, Class Diagram, Sequence Diagram, Activity Diagram
- `03-csdl/` — Phụ thuộc hàm, phủ tối thiểu, chuẩn hóa BCNF, chứng minh không mất mát thông tin (Tableau) & schema SQL DDL
- `04-thiet-ke-he-thong/` — Kiến trúc hệ thống và giao diện thiết kế
- `07-nguon-code/demo-giao-dien/` — Ứng dụng Fullstack hoàn chỉnh (React + Vite + Node.js + SQLite)

## Hướng dẫn chạy ứng dụng
```bash
# 1. Di chuyển vào thư mục demo giao diện
cd 07-nguon-code/demo-giao-dien

# 2. Cài đặt các gói phụ thuộc (React, Vite)
npm install

# 3. Chạy ứng dụng Fullstack (Tự động phục vụ React App + SQLite API)
npm start
# -> Mở trình duyệt truy cập: http://localhost:4173

# (Tùy chọn) Chạy chế độ Vite Dev Server với Hot Module Replacement:
npm run dev
# -> Truy cập: http://localhost:5173
```
