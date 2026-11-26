/**
 * ============================================================================
 * KHUNG CẤU HÌNH HƯỚNG DẪN SỬ DỤNG HỆ THỐNG (TASK DÀI HẠN - DRAFT)
 * ============================================================================
 * Trạng thái: DRAFT_WAITING_FEATURE_FREEZE
 * Quy định: Chỉ lên khung kiến trúc và danh sách điểm neo (data-tour-id).
 * Khi nào toàn bộ tính năng (UI GV/SV, Excel Import, GitHub Dashboard...)
 * được chốt hoàn toàn, mới viết nội dung chi tiết, sắp thứ tự và bật Modal Tour.
 */

export const GUIDE_TOUR_VERSION = '0.1.0-draft';
export const GUIDE_TOUR_ENABLED = false; // Chỉ bật thành true khi chốt xong dự án

// Danh sách các điểm neo Tour đã đăng ký trong giao diện (Task B5)
export const REGISTERED_TOUR_TARGETS = [
  'tour-class-selector',
  'tour-gv-add-topics',
  'tab-manual-topic',
  'tab-import-excel',
  'excel-dropzone',
  'excel-column-mapping',
  'topic-max-members-input',
  'topic-unlimited-checkbox',
  'team-member-disabled',
  'tour-gv-groups-tab',
  'tour-sv-status-card',
  'tour-nav-kanban',
  'tour-nav-github'
];

export const GUIDE_TOUR_SCHEMA = {
  // Các bước hướng dẫn dành cho Giảng viên phụ trách môn học (GVPTMH)
  lecturer: [
    {
      id: 'gv-class-select',
      order: 1,
      targetTourId: 'tour-class-selector',
      title: '[Chờ chốt] Chọn & Tạo Lớp môn học',
      description: 'Nội dung hướng dẫn GVPTMH tạo lớp học phần mới và chuyển đổi giữa các lớp.',
      placement: 'bottom'
    },
    {
      id: 'gv-import-excel',
      order: 2,
      targetTourId: 'tour-gv-add-topics',
      title: '[Chờ chốt] Thêm & Import Excel Ngân hàng Đề tài',
      description: 'Nội dung hướng dẫn nạp đề tài từ file Excel/CSV riêng của giảng viên và thiết lập số thành viên.',
      placement: 'bottom'
    },
    {
      id: 'gv-groups-overview',
      order: 3,
      targetTourId: 'tour-gv-groups-tab',
      title: '[Chờ chốt] Theo dõi Tiến độ Nhóm & GitHub',
      description: 'Nội dung hướng dẫn xem tổng quan các nhóm, vào Kanban chấm mốc và xem GitHub Dashboard.',
      placement: 'top'
    }
  ],

  // Các bước hướng dẫn dành cho Sinh viên
  student: [
    {
      id: 'sv-topic-action',
      order: 1,
      targetTourId: 'tour-sv-status-card',
      title: '[Chờ chốt] Trạng thái & Chọn Đề tài',
      description: 'Nội dung hướng dẫn sinh viên chọn đề tài hoặc lập nhóm (loại trừ sinh viên đã có nhóm).',
      placement: 'bottom'
    },
    {
      id: 'sv-workspace-kanban',
      order: 2,
      targetTourId: 'tour-nav-kanban',
      title: '[Chờ chốt] Quản lý Công việc & Nộp Tài liệu',
      description: 'Nội dung hướng dẫn tự chấm %, xem badge hạn chót và đính kèm tệp báo cáo.',
      placement: 'right'
    },
    {
      id: 'sv-github-dashboard',
      order: 3,
      targetTourId: 'tour-nav-github',
      title: '[Chờ chốt] Kết nối & Đồng bộ GitHub Dashboard',
      description: 'Nội dung hướng dẫn gắn link Repo GitHub và ánh xạ tài khoản thành viên push code.',
      placement: 'right'
    }
  ]
};
