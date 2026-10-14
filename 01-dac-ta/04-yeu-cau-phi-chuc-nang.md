# Yêu cầu phi chức năng (NFR)

| Mã | Nhóm | Mô tả |
|---|---|---|
| NFR-01 | Bảo mật | Mật khẩu lưu dạng hash; API yêu cầu xác thực JWT (hoặc session) |
| NFR-02 | Phân quyền | Mọi endpoint nghiệp vụ kiểm tra vai trò + quan hệ với đồ án |
| NFR-03 | Usability | Giao diện tiếng Việt; đủ rõ cho demo bảo vệ |
| NFR-04 | Hiệu năng | Thao tác CRUD thông thường phản hồi chấp nhận được trên máy local (mục tiêu < 2s với dữ liệu demo) |
| NFR-05 | Triển khai | Chạy được trên môi trường local (Node + PostgreSQL); có README hướng dẫn chạy |
| NFR-06 | Dữ liệu | Có script seed tài khoản demo 4 vai trò |
| NFR-07 | File | Giới hạn dung lượng file đính kèm (ví dụ ≤ 10MB/file) trong MVP |
| NFR-08 | Bảo trì | Cấu trúc thư mục frontend/backend tách bạch, dễ mở rộng |
| NFR-09 | Độ tin cậy | Không mất dữ liệu khi restart app nếu PostgreSQL còn nguyên |
| NFR-10 | Phạm vi | Không phụ thuộc dịch vụ cloud bên ngoài trong MVP |
