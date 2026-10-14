# Phạm vi Sản phẩm Tối thiểu (MVP)

## 1. Trong phạm vi thực hiện (Đồ án cơ sở)
- **Xác thực & phân quyền:** Đăng nhập, phân quyền 4 vai trò (Quản trị viên, Giảng viên hướng dẫn, Nhóm trưởng, Thành viên).
- **Quản lý đồ án & nhóm:** Phân loại đồ án (Môn học, Cơ sở, Chuyên ngành) + mô hình nhóm 1–1 với đồ án.
- **Mốc tiến độ (Milestone):** Thiết lập các mốc thời gian và sản phẩm bàn giao quan trọng.
- **Quản lý công việc:** Giao việc theo luồng phân cấp (Giảng viên → Nhóm trưởng → Thành viên), quản lý hạn chót, trạng thái công việc (Cần làm / Đang làm / Hoàn thành / Trễ hạn).
- **Đo lường tiến độ:** Cập nhật % tiến độ công việc, quy trình duyệt chốt % tiến độ và tự động tính % tiến độ tổng thể đồ án.
- **Trao đổi & tài liệu:** Bình luận trao đổi trực tiếp trên công việc + tải lên/tải xuống tệp đính kèm (lưu trữ cục bộ).
- **Hộp thư thông báo:** Thông báo việc mới, nhắc hạn chót và thông báo tiến độ.
- **Bảng điều khiển trực quan (Dashboard):** Biểu đồ tiến độ, phân bố trạng thái công việc, danh sách việc trễ hạn.
- **Môi trường triển khai:** Chạy thử nghiệm và nghiệm thu trực tiếp trên môi trường **cục bộ (Localhost)**.

---

## 2. Ngoài phạm vi thực hiện (Không triển khai trong kỳ này)
- Gửi Email / SMS / Thông báo đẩy di động thực tế.
- Tích hợp trí tuệ nhân tạo (AI) để tự động phân chia công việc.
- Ứng dụng di động (Mobile App trên iOS / Android).
- Tích hợp tự động với GitHub / GitLab.
- Bắt buộc đưa lên máy chủ Internet (Cloud / VPS Hosting).
- Một đồ án có nhiều nhóm độc lập cùng làm chung đề tài.
- Các tính năng thanh toán, thương mại điện tử hoặc quản lý nhân sự chung của trường.

---

## 3. Hướng phát triển sau Đồ án cơ sở
- Tích hợp dịch vụ gửi Email thông báo tự động.
- Bổ sung biểu đồ Gantt trực quan hóa tiến độ theo dòng thời gian.
- Thêm tiêu chí đánh giá, chấm điểm đồ án trực tiếp của Giảng viên.
- Đóng gói Docker và triển khai lên hệ thống máy chủ Cloud trực tuyến.
- Kết nối đồng bộ với cổng thông tin nộp bài tập lớn / đồ án của Khoa Công nghệ thông tin.
