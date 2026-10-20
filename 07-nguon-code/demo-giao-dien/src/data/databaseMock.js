/**
 * Dữ liệu mô phỏng CSDL 9 bảng thuần khiết (Bám 100% 03-csdl/07-schema-sql-du-kien.md)
 * Tuyệt đối không thêm thuộc tính hay bảng ngoài phạm vi CSDL đã khóa.
 */

export const mockDatabase = {
  // 1. Bảng NGUOI_DUNG
  nguoi_dung: [
    {
      ma_nguoi_dung: "u-gv-01",
      email: "khuyenbp@huflit.edu.vn",
      mat_khau_bam: "$2b$10$hashed_gv_pass_demo",
      ho_ten: "ThS. Bùi Phú Khuyên",
      vai_tro_he_thong: "giangvien",
      trang_thai_hoat_dong: true,
      thoi_gian_tao: "2026-09-01T08:00:00Z"
    },
    {
      ma_nguoi_dung: "u-sv-01",
      email: "2180606023@huflit.edu.vn",
      mat_khau_bam: "$2b$10$hashed_truc_pass_demo",
      ho_ten: "Đỗ Minh Trực",
      vai_tro_he_thong: "sinhvien",
      trang_thai_hoat_dong: true,
      thoi_gian_tao: "2026-09-05T09:00:00Z"
    },
    {
      ma_nguoi_dung: "u-sv-02",
      email: "2280600494@huflit.edu.vn",
      mat_khau_bam: "$2b$10$hashed_duy_pass_demo",
      ho_ten: "Trần Minh Duy",
      vai_tro_he_thong: "sinhvien",
      trang_thai_hoat_dong: true,
      thoi_gian_tao: "2026-09-05T09:00:00Z"
    }
  ],

  // 2. Bảng DO_AN
  do_an: [
    {
      ma_do_an: "da-dacs-01",
      ten_do_an: "Hệ thống quản lý công việc và tiến độ đồ án nhóm",
      loai_do_an: "co_so",
      ten_mon_hoc: "Đồ án cơ sở - Ngành Công nghệ thông tin",
      noi_dung_muc_tieu: "Xây dựng hệ thống web hỗ trợ nhóm sinh viên và giảng viên hướng dẫn theo dõi sát sao tiến độ công việc, mốc bàn giao và đánh giá minh bạch theo từng giai đoạn.",
      tien_do_tong: 65.00,
      trang_thai: "dang_thuc_hien",
      ma_giang_vien: "u-gv-01",
      thoi_gian_tao: "2026-09-10T10:00:00Z"
    }
  ],

  // 3. Bảng NHOM (Quan hệ 1-1 với do_an)
  nhom: [
    {
      ma_nhom: "nhom-01",
      ma_do_an: "da-dacs-01",
      ten_nhom: "Nhóm Đồ án Cơ sở 05"
    }
  ],

  // 4. Bảng THANH_VIEN_NHOM
  thanh_vien_nhom: [
    {
      ma_thanh_vien_nhom: "tvn-01",
      ma_nhom: "nhom-01",
      ma_nguoi_dung: "u-sv-01",
      vai_tro_trong_nhom: "nhom_truong",
      thoi_gian_tham_gia: "2026-09-10T10:30:00Z"
    },
    {
      ma_thanh_vien_nhom: "tvn-02",
      ma_nhom: "nhom-01",
      ma_nguoi_dung: "u-sv-02",
      vai_tro_trong_nhom: "thanh_vien",
      thoi_gian_tham_gia: "2026-09-10T10:30:00Z"
    }
  ],

  // 5. Bảng MOC_TIEN_DO (Milestones)
  moc_tien_do: [
    {
      ma_moc: "moc-01",
      ma_do_an: "da-dacs-01",
      ten_moc: "Mốc 1: Khảo sát nghiệp vụ & Đặc tả yêu cầu",
      han_hoan_thanh: "2026-09-25",
      trang_thai: "hoan_thanh",
      noi_dung_mo_ta: "Chốt phạm vi 8 use case cốt lõi, danh sách tác tử và quy tắc phân quyền nhóm."
    },
    {
      ma_moc: "moc-02",
      ma_do_an: "da-dacs-01",
      ten_moc: "Mốc 2: Phân tích & Chuẩn hóa CSDL BCNF",
      han_hoan_thanh: "2026-10-15",
      trang_thai: "hoan_thanh",
      noi_dung_mo_ta: "Xác định 20 thuộc tính, tập phụ thuộc hàm phủ tối thiểu, phân rã R1-R8 và bảng Tableau 20x8."
    },
    {
      ma_moc: "moc-03",
      ma_do_an: "da-dacs-01",
      ten_moc: "Mốc 3: Thiết kế Giao diện Demo & Kiến trúc API",
      han_hoan_thanh: "2026-10-30",
      trang_thai: "chua_hoan_thanh",
      noi_dung_mo_ta: "Thiết kế UI theo TasteSkill v2 và chuẩn bị các kịch bản báo cáo với GVHD."
    },
    {
      ma_moc: "moc-04",
      ma_do_an: "da-dacs-01",
      ten_moc: "Mốc 4: Lập trình MVP & Báo cáo đồ án",
      han_hoan_thanh: "2026-11-20",
      trang_thai: "chua_hoan_thanh",
      noi_dung_mo_ta: "Lập trình React + Node.js Express + PostgreSQL local và viết tài liệu thuyết minh dacs.doc."
    }
  ],

  // 6. Bảng CONG_VIEC
  cong_viec: [
    {
      ma_cong_viec: "cv-01",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-01",
      tieu_de: "Khảo sát và lập bảng đặc tả yêu cầu chức năng (FR)",
      noi_dung_mo_ta: "Hoàn thiện bảng đặc tả 8 use case chính và phân rã các bước tương tác tác tử.",
      trang_thai: "hoan_thanh",
      phan_tram_tien_do: 100.0,
      trang_thai_khoa: true,
      han_chot: "2026-09-20T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-01",
      ma_nguoi_tao: "u-gv-01",
      ma_nguoi_khoa: "u-gv-01",
      thoi_gian_tao: "2026-09-12T08:00:00Z"
    },
    {
      ma_cong_viec: "cv-02",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-01",
      tieu_de: "Vẽ sơ đồ Use Case và Class Diagram phân tích",
      noi_dung_mo_ta: "Đảm bảo tuân thủ quy tắc: thuộc tính là danh từ, phương thức là động từ hành động.",
      trang_thai: "hoan_thanh",
      phan_tram_tien_do: 100.0,
      trang_thai_khoa: true,
      han_chot: "2026-09-24T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-02",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: "u-sv-01",
      thoi_gian_tao: "2026-09-15T09:00:00Z"
    },
    {
      ma_cong_viec: "cv-03",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-02",
      tieu_de: "Tính toán phủ tối thiểu và tìm khóa bằng bao đóng",
      noi_dung_mo_ta: "Tập Q gồm 20 thuộc tính A-W, chứng minh khóa chính duy nhất k = A.",
      trang_thai: "hoan_thanh",
      phan_tram_tien_do: 100.0,
      trang_thai_khoa: true,
      han_chot: "2026-10-05T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-01",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: "u-gv-01",
      thoi_gian_tao: "2026-09-26T08:30:00Z"
    },
    {
      ma_cong_viec: "cv-04",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-02",
      tieu_de: "Lập bảng Tableau 20x8 chứng minh Bảo toàn thông tin",
      noi_dung_mo_ta: "Thuật toán Chase lấp đầy hàng R1 với các dấu tích, xác nhận không mất mát thông tin khi nối tự nhiên.",
      trang_thai: "hoan_thanh",
      phan_tram_tien_do: 100.0,
      trang_thai_khoa: true,
      han_chot: "2026-10-12T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-02",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: "u-gv-01",
      thoi_gian_tao: "2026-10-06T10:00:00Z"
    },
    {
      ma_cong_viec: "cv-05",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-03",
      tieu_de: "Xây dựng giao diện Demo Workspace theo TasteSkill v2",
      noi_dung_mo_ta: "Bảng Kanban 4 cột, ngăn trượt chi tiết công việc, thanh chuyển vai trò để báo cáo GVHD.",
      trang_thai: "dang_lam",
      phan_tram_tien_do: 75.0,
      trang_thai_khoa: false,
      han_chot: "2026-10-25T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-01",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: null,
      thoi_gian_tao: "2026-10-16T14:00:00Z"
    },
    {
      ma_cong_viec: "cv-06",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-03",
      tieu_de: "Đặc tả các Endpoint REST API tương ứng 9 bảng CSDL",
      noi_dung_mo_ta: "Soạn thảo tài liệu API contract trong 04-thiet-ke-he-thong/02-api-du-kien.md.",
      trang_thai: "dang_lam",
      phan_tram_tien_do: 40.0,
      trang_thai_khoa: false,
      han_chot: "2026-10-28T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-02",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: null,
      thoi_gian_tao: "2026-10-17T09:00:00Z"
    },
    {
      ma_cong_viec: "cv-07",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-03",
      tieu_de: "Soạn kịch bản trả lời phản biện cơ sở dữ liệu",
      noi_dung_mo_ta: "Chuẩn bị các câu hỏi lý thuyết: tại sao có ma_do_an trong cong_viec, tại sao tách nguoi_dung và thanh_vien_nhom.",
      trang_thai: "can_lam",
      phan_tram_tien_do: 0.0,
      trang_thai_khoa: false,
      han_chot: "2026-10-30T17:00:00Z",
      ma_nguoi_thuc_hien: "u-sv-01",
      ma_nguoi_tao: "u-gv-01",
      ma_nguoi_khoa: null,
      thoi_gian_tao: "2026-10-18T11:00:00Z"
    },
    {
      ma_cong_viec: "cv-08",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-04",
      tieu_de: "Khởi tạo cấu trúc dự án React và Express cục bộ",
      noi_dung_mo_ta: "Chờ phê duyệt từ cổng duyệt CHO-DUYET.md trước khi chạy mã nguồn.",
      trang_thai: "can_lam",
      phan_tram_tien_do: 0.0,
      trang_thai_khoa: false,
      han_chot: "2026-11-05T23:59:00Z",
      ma_nguoi_thuc_hien: "u-sv-02",
      ma_nguoi_tao: "u-sv-01",
      ma_nguoi_khoa: null,
      thoi_gian_tao: "2026-10-19T10:00:00Z"
    },
    {
      ma_cong_viec: "cv-09",
      ma_do_an: "da-dacs-01",
      ma_moc: "moc-02",
      tieu_de: "Rà soát định dạng font chữ Time New Roman trong biểu mẫu Word",
      noi_dung_mo_ta: "Kiểm tra biểu mẫu theo dõi tiến độ tuần 1, tránh lỗi tràn bảng và không thẳng lề.",
      trang_thai: "tre_han",
      phan_tram_tien_do: 20.0,
      trang_thai_khoa: false,
      han_chot: "2026-10-14T17:00:00Z",
      ma_nguoi_thuc_hien: "u-sv-02",
      ma_nguoi_tao: "u-gv-01",
      ma_nguoi_khoa: null,
      thoi_gian_tao: "2026-10-08T08:00:00Z"
    }
  ],

  // 7. Bảng BINH_LUAN
  binh_luan: [
    {
      ma_binh_luan: "bl-01",
      ma_cong_viec: "cv-05",
      ma_nguoi_dung: "u-gv-01",
      noi_dung: "Giao diện demo cần thiết kế sạch sẽ, trực quan theo đúng cấu trúc bảng CSDL, không đưa các tính năng rườm rà vào.",
      thoi_gian_tao: "2026-10-18T15:20:00Z"
    },
    {
      ma_binh_luan: "bl-02",
      ma_cong_viec: "cv-05",
      ma_nguoi_dung: "u-sv-01",
      noi_dung: "Dạ thưa Thầy, nhóm em đã áp dụng bộ tokens chuẩn TasteSkill v2 với bề mặt phẳng 1px và màu sắc tối giản nhấn vào trạng thái công việc ạ.",
      thoi_gian_tao: "2026-10-19T09:10:00Z"
    },
    {
      ma_binh_luan: "bl-03",
      ma_cong_viec: "cv-09",
      ma_nguoi_dung: "u-sv-02",
      noi_dung: "Em đang chỉnh lại phần lề theo đúng hướng dẫn 2-2.5-3-2 cm của Khoa, hôm nay sẽ nộp lại Thầy xem.",
      thoi_gian_tao: "2026-10-16T11:45:00Z"
    }
  ],

  // 8. Bảng TEP_DINH_KEM
  tep_dinh_kem: [
    {
      ma_tep: "tep-01",
      ma_cong_viec: "cv-04",
      ma_nguoi_dung: "u-sv-01",
      ten_tep: "08-ket-qua-tinh-toan-viet-tay.md",
      duong_dan_tep: "/uploads/08-ket-qua-tinh-toan-viet-tay.md",
      loai_tep: "text/markdown",
      dung_luong: 6908,
      thoi_gian_tao: "2026-10-12T16:00:00Z"
    },
    {
      ma_tep: "tep-02",
      ma_cong_viec: "cv-05",
      ma_nguoi_dung: "u-sv-01",
      ten_tep: "erd.drawio",
      duong_dan_tep: "/uploads/erd.drawio",
      loai_tep: "application/xml",
      dung_luong: 31602,
      thoi_gian_tao: "2026-10-17T14:30:00Z"
    }
  ],

  // 9. Bảng THONG_BAO
  thong_bao: [
    {
      ma_thong_bao: "tb-01",
      ma_nguoi_dung: "u-sv-01",
      ma_do_an: "da-dacs-01",
      ma_cong_viec: "cv-05",
      loai_thong_bao: "nhac_nho_tien_do",
      tieu_de: "GVHD Bùi Phú Khuyên đã nhắc nhở tiến độ",
      noi_dung: "Chuẩn bị bản giao diện demo hoàn chỉnh trước buổi báo cáo tiến độ tuần.",
      trang_thai_doc: false,
      thoi_gian_tao: "2026-10-19T08:00:00Z"
    },
    {
      ma_thong_bao: "tb-02",
      ma_nguoi_dung: "u-sv-02",
      ma_do_an: "da-dacs-01",
      ma_cong_viec: "cv-09",
      loai_thong_bao: "canh_bao_tre_han",
      tieu_de: "Cảnh báo: Công việc đã quá hạn chót",
      noi_dung: "Công việc 'Rà soát định dạng font chữ Time New Roman trong biểu mẫu Word' đã quá hạn ngày 14/10/2026.",
      trang_thai_doc: true,
      thoi_gian_tao: "2026-10-15T00:01:00Z"
    }
  ]
};
