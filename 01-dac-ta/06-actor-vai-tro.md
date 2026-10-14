# Tác tử và Phân quyền Vai trò (Actor & Roles)

## 1. Danh sách tác tử (Actors)
| Tác tử | Tên tiếng Việt | Mô tả trách nhiệm trong hệ thống |
|---|---|---|
| Admin | Quản trị viên hệ thống | Quản trị tài khoản, danh mục đồ án, phân quyền cấp cao |
| GVHD | Giảng viên hướng dẫn | Tạo đề tài, thiết lập mốc tiến độ, giao việc cho nhóm trưởng, đánh giá và duyệt tiến độ |
| Nhóm trưởng | Nhóm trưởng sinh viên | Sinh viên đại diện nhóm, phân chia công việc cho thành viên, tổng hợp và chốt tiến độ nội bộ |
| Thành viên | Thành viên sinh viên | Sinh viên trong nhóm, nhận việc, thực hiện và cập nhật tiến độ thực tế |
| Hệ thống | Tiến trình hệ thống tự động | Chạy ngầm định kỳ để kiểm tra hạn chót, phát hiện trễ hạn và gửi thông báo tự động |

---

## 2. Ma trận phân quyền chi tiết

| Nhóm chức năng nghiệp vụ | Quản trị viên | Giảng viên hướng dẫn | Nhóm trưởng | Thành viên sinh viên |
|---|:---:|:---:|:---:|:---:|
| Quản lý tài khoản người dùng | ✓ | | | |
| Quản lý thông tin đồ án phụ trách | ✓ (toàn hệ thống) | ✓ | Chỉ xem | Chỉ xem |
| Phân công Nhóm trưởng và Thành viên | ✓ | ✓ | | |
| Quản lý mốc tiến độ (Milestone) | | ✓ | ✓ | Chỉ xem |
| Giao mục tiêu / công việc cho Nhóm trưởng | | ✓ | | |
| Phân chia công việc cho Thành viên | | ✓ (quyền can thiệp) | ✓ | |
| Cập nhật % tiến độ công việc được giao | | ✓ | ✓ | ✓ (việc của mình) |
| Phê duyệt và chốt % tiến độ công việc | | ✓ | ✓ | |
| Bình luận và đính kèm tệp tài liệu | ✓ | ✓ | ✓ | ✓ |
| Gửi lời nhắc tiến độ trực tiếp | | ✓ | | |
| Xem bảng theo dõi tiến độ đồ án (Dashboard) | ✓ | ✓ | ✓ | ✓ |
| Hộp thư thông báo hệ thống | ✓ | ✓ | ✓ | ✓ |

---

## 3. Ghi chú quy tắc nghiệp vụ
- Một sinh viên có thể đồng thời là **Nhóm trưởng** ở đồ án A và là **Thành viên** ở đồ án B.
- Vai trò trong đồ án được lưu trữ tại trường `vai_tro_trong_nhom` của bảng `thanh_vien_nhom` (`nhom_truong` hoặc `thanh_vien`).
- Vai trò hệ thống được lưu trữ tại trường `vai_tro_he_thong` của bảng `nguoi_dung` (`quantrivien`, `giangvien`, `sinhvien`).
