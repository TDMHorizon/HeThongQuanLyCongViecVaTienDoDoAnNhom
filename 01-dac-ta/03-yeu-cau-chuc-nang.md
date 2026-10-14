# Yêu cầu Chức năng (Functional Requirements - FR)

## Nhóm A — Xác thực & Quản trị người dùng
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-01 | Đăng nhập hệ thống bằng Email và Mật khẩu | Tất cả tác tử |
| FR-02 | Đăng xuất khỏi hệ thống và hủy phiên làm việc | Tất cả tác tử |
| FR-03 | Quản trị viên thêm mới, chỉnh sửa, khóa/mở khóa tài khoản và phân quyền hệ thống (Quản trị viên / Giảng viên / Sinh viên) | Quản trị viên |
| FR-04 | Xem và cập nhật thông tin hồ sơ cá nhân | Tất cả tác tử |

---

## Nhóm B — Quản lý Đồ án & Nhóm sinh viên
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-05 | Tạo mới đồ án (Tên đề tài, loại đồ án, tên môn học, mô tả mục tiêu tổng quát) | Giảng viên, Quản trị viên |
| FR-06 | Cập nhật thông tin và xem danh sách đồ án theo đúng thẩm quyền | Giảng viên, Nhóm trưởng, Thành viên, Quản trị viên |
| FR-07 | Phân công nhóm sinh viên, chỉ định Nhóm trưởng và các Thành viên (Mỗi đồ án đúng 1 nhóm) | Giảng viên, Quản trị viên |
| FR-08 | Xem danh sách thành viên trong nhóm đồ án | Giảng viên, Nhóm trưởng, Thành viên |

---

## Nhóm C — Quản lý Mốc tiến độ (Milestone)
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-09 | Thiết lập, chỉnh sửa, xóa các mốc tiến độ quan trọng của đồ án (Tên mốc, hạn hoàn thành, mô tả yêu cầu) | Giảng viên, Nhóm trưởng |
| FR-10 | Xem danh sách các mốc tiến độ của đồ án theo trình tự thời gian | Giảng viên, Nhóm trưởng, Thành viên |
| FR-11 | Cập nhật trạng thái của từng mốc tiến độ (Chưa hoàn thành / Đã hoàn thành) | Giảng viên, Nhóm trưởng |

---

## Nhóm D — Quản lý Công việc & Tiến độ thực hiện
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-12 | Giảng viên giao mục tiêu / nhiệm vụ lớn xuống Nhóm trưởng | Giảng viên |
| FR-13 | Nhóm trưởng chia nhỏ công việc, phân công cho Thành viên thực hiện kèm thời hạn hoàn thành | Nhóm trưởng |
| FR-14 | Xem danh sách công việc được giao cá nhân và toàn bộ công việc trong đồ án | Giảng viên, Nhóm trưởng, Thành viên |
| FR-15 | Cập nhật trạng thái công việc: Cần làm (To-do) / Đang làm (In Progress) / Hoàn thành (Done) | Thành viên, Nhóm trưởng, Giảng viên |
| FR-16 | Hệ thống tự động quét và đánh dấu trạng thái **Trễ hạn** (Overdue) khi quá hạn chót mà việc chưa hoàn thành | Hệ thống tự động |
| FR-17 | Thành viên và Nhóm trưởng cập nhật phần trăm tiến độ hoàn thành thực tế của công việc (0% - 100%) | Thành viên, Nhóm trưởng |
| FR-18 | Nhóm trưởng hoặc Giảng viên kiểm tra và **chốt tiến độ** (Khóa không cho phép sửa % trừ khi mở khóa lại) | Nhóm trưởng, Giảng viên |
| FR-19 | Hệ thống tự động tính toán % tiến độ tổng thể của đồ án; Giảng viên xác nhận tiến độ tổng | Giảng viên, Nhóm trưởng |
| FR-20 | Bộ lọc công việc thông minh theo trạng thái, người thực hiện, mốc tiến độ và thời hạn | Giảng viên, Nhóm trưởng, Thành viên |

---

## Nhóm E — Trao đổi Bình luận & Tệp tài liệu đính kèm
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-21 | Thêm mới và xem bình luận trao đổi, góp ý ngay trên từng công việc | Giảng viên, Nhóm trưởng, Thành viên |
| FR-22 | Tải lên (Upload) và tải xuống (Download) các tệp tài liệu, biên bản báo cáo, mã nguồn đính kèm | Giảng viên, Nhóm trưởng, Thành viên |

---

## Nhóm F — Thông báo & Bảng theo dõi tiến độ trực quan (Dashboard)
| Mã | Mô tả chi tiết yêu cầu chức năng | Tác tử chính |
|---|---|---|
| FR-23 | Hệ thống tự động gửi thông báo đến hộp thư khi có công việc mới được phân công | Hệ thống tự động |
| FR-24 | Hệ thống tự động gửi thông báo nhắc nhở khi công việc sắp đến hạn, đến hạn hoặc bị quá hạn | Hệ thống tự động |
| FR-25 | Tự động phát thông báo khi công việc được cập nhật tiến độ hoặc được phê duyệt chốt tiến độ | Hệ thống tự động |
| FR-26 | Giảng viên gửi lời nhắc nhở tiến độ trực tiếp tới cá nhân Nhóm trưởng hoặc Thành viên cụ thể | Giảng viên |
| FR-27 | Xem danh sách thông báo và đánh dấu trạng thái đã đọc | Tất cả tác tử |
| FR-28 | Bảng theo dõi tiến độ đồ án trực quan (Biểu đồ % hoàn thành, thống kê số lượng việc theo trạng thái, cảnh báo quá hạn) | Giảng viên, Nhóm trưởng, Thành viên |
