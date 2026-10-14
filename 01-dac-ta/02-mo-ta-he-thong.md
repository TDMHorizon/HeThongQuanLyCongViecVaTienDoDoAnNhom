# Mô tả hệ thống

## 1. Tổng quan
Hệ thống là ứng dụng web giúp các bên liên quan đến đồ án nhóm:
- Tạo và quản lý đồ án theo loại (môn học / cơ sở / chuyên ngành)
- Tổ chức nhóm (1 đồ án – 1 nhóm) với nhóm trưởng và thành viên
- Giao việc theo cấp: GVHD → nhóm trưởng → thành viên
- Theo dõi milestone, task, % tiến độ, trạng thái (gồm Trễ hạn)
- Trao đổi qua bình luận và file đính kèm trên task
- Nhận thông báo trong hệ thống (inbox)

## 2. Thành phần logic
| Thành phần | Vai trò |
|---|---|
| Frontend (React) | Giao diện theo từng vai trò, dashboard biểu đồ |
| Backend API (Express) | Xác thực, phân quyền, nghiệp vụ, thông báo |
| Database (PostgreSQL) | Lưu user, đồ án, nhóm, milestone, task, comment, file meta, notification |
| File storage local | Lưu file đính kèm trên ổ đĩa máy (MVP local) |

## 3. Luồng nghiệp vụ chính
1. Admin tạo tài khoản demo / quản trị user
2. GVHD tạo đồ án, chỉ định nhóm trưởng & thành viên
3. GVHD tạo milestone / giao việc xuống NT
4. NT phân task cho TV (có deadline nếu có hạn)
5. TV cập nhật trạng thái/%, comment, upload file
6. NT hoặc GVHD **chốt %** task
7. Hệ thống cập nhật % tổng (theo quy tắc) và gửi thông báo liên quan
8. Task quá hạn → trạng thái Trễ hạn + thông báo nhắc

## 4. Nguyên tắc thiết kế
- Phân quyền theo vai trò (RBAC)
- Mọi thao tác nghiệp vụ quan trọng tạo notification inbox
- Không gửi email thật trong MVP
