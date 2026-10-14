# Ý tưởng đề tài

## 1. Bối cảnh
Sinh viên làm đồ án theo nhóm (đồ án môn học, đồ án cơ sở, đồ án chuyên ngành) thường phân công việc bằng chat/file rời. Hệ quả:
- Không rõ ai đang làm gì, việc nào trễ hạn
- GVHD khó theo dõi tiến độ thực tế
- Nhóm trưởng khó phân việc có kiểm soát và đo % hoàn thành

## 2. Ý tưởng giải pháp
Xây **web quản lý công việc và tiến độ đồ án nhóm** với:
- Bốn vai trò: Admin, GVHD, Nhóm trưởng, Thành viên
- Mô hình **1 đồ án = 1 nhóm**
- Luồng giao việc **GVHD → Nhóm trưởng → Thành viên**
- Milestone, task (có deadline & trạng thái Trễ hạn), bình luận, file đính kèm
- Thông báo inbox khi giao việc / nhắc hạn / cập nhật tiến độ
- Dashboard % tiến độ (task có bước chốt; tổng đồ án tính dần theo mục tiêu)

## 3. Giá trị
- Đúng chuyên ngành Công nghệ phần mềm: phân tích yêu cầu, thiết kế, phân quyền, quy trình
- Phục vụ đúng ngữ cảnh học vụ đồ án
- Có tính phát triển (email remind, Gantt, deploy online…)

## 4. Phạm vi sản phẩm kỳ này
Web chạy **local**: React + Node.js (Express) + PostgreSQL + biểu đồ tiến độ.
