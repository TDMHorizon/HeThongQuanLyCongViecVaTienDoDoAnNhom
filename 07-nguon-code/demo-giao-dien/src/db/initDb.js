import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../dacs.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

console.log('[DB] Đang khởi tạo CSDL SQLite tại:', dbPath);

// Khởi tạo Database
const db = new DatabaseSync(dbPath);

// Bật khóa ngoại
db.exec('PRAGMA foreign_keys = ON;');

// Đọc và chạy schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('[DB] Đã khởi tạo 9 bảng vật lý thành công.');

// Kiểm tra xem đã có dữ liệu chưa
const userCount = db.prepare('SELECT COUNT(*) as count FROM nguoi_dung').get().count;

if (userCount === 0) {
  console.log('[DB] Đang nạp dữ liệu mẫu thực tế cho đồ án DACS...');

  // 1. NGUOI_DUNG
  const insertUser = db.prepare(`
    INSERT INTO nguoi_dung (ma_nguoi_dung, email, mat_khau_bam, ho_ten, vai_tro_he_thong, trang_thai_hoat_dong)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('u-gv-01', 'khuyenbp@huflit.edu.vn', '$2b$10$hashed_gv_pass_demo', 'ThS. Bùi Phú Khuyên', 'giangvien', 1);
  insertUser.run('u-sv-01', '2180606023@huflit.edu.vn', '$2b$10$hashed_truc_pass_demo', 'Đỗ Minh Trực', 'sinhvien', 1);
  insertUser.run('u-sv-02', '2280600494@huflit.edu.vn', '$2b$10$hashed_duy_pass_demo', 'Trần Minh Duy', 'sinhvien', 1);

  // 2. DO_AN
  const insertProject = db.prepare(`
    INSERT INTO do_an (ma_do_an, ten_do_an, loai_do_an, ten_mon_hoc, noi_dung_muc_tieu, tien_do_tong, trang_thai, ma_giang_vien)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProject.run(
    'da-dacs-01',
    'Hệ thống quản lý công việc và tiến độ đồ án nhóm',
    'co_so',
    'Đồ án cơ sở - Ngành Công nghệ thông tin',
    'Hệ thống web hỗ trợ sinh viên và giảng viên theo dõi sát sao tiến độ công việc, mốc bàn giao và đánh giá minh bạch theo từng giai đoạn.',
    65.0,
    'dang_thuc_hien',
    'u-gv-01'
  );

  // 3. NHOM
  db.prepare(`INSERT INTO nhom (ma_nhom, ma_do_an, ten_nhom) VALUES (?, ?, ?)`).run(
    'nhom-01', 'da-dacs-01', 'Nhóm Đồ án Cơ sở 05'
  );

  // 4. THANH_VIEN_NHOM
  const insertMember = db.prepare(`
    INSERT INTO thanh_vien_nhom (ma_thanh_vien_nhom, ma_nhom, ma_nguoi_dung, vai_tro_trong_nhom)
    VALUES (?, ?, ?, ?)
  `);
  insertMember.run('tvn-01', 'nhom-01', 'u-sv-01', 'nhom_truong');
  insertMember.run('tvn-02', 'nhom-01', 'u-sv-02', 'thanh_vien');

  // 5. MOC_TIEN_DO
  const insertMilestone = db.prepare(`
    INSERT INTO moc_tien_do (ma_moc, ma_do_an, ten_moc, han_hoan_thanh, trang_thai, noi_dung_mo_ta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertMilestone.run('moc-01', 'da-dacs-01', 'Mốc 1: Khảo sát nghiệp vụ & Đặc tả yêu cầu', '2026-09-25', 'hoan_thanh', 'Chốt phạm vi 8 use case cốt lõi, danh sách tác tử và quy tắc phân quyền nhóm.');
  insertMilestone.run('moc-02', 'da-dacs-01', 'Mốc 2: Phân tích & Chuẩn hóa CSDL BCNF', '2026-10-15', 'hoan_thanh', 'Xác định 20 thuộc tính, tập phụ thuộc hàm phủ tối thiểu, phân rã R1-R8 và bảng Tableau 20x8.');
  insertMilestone.run('moc-03', 'da-dacs-01', 'Mốc 3: Thiết kế Giao diện Demo & Kiến trúc API', '2026-10-30', 'chua_hoan_thanh', 'Thiết kế UI theo TasteSkill v2 và chuẩn bị các kịch bản báo cáo với GVHD.');
  insertMilestone.run('moc-04', 'da-dacs-01', 'Mốc 4: Lập trình MVP & Báo cáo đồ án', '2026-11-20', 'chua_hoan_thanh', 'Lập trình React + Node.js Express + SQLite local và viết tài liệu thuyết minh dacs.doc.');

  // 6. CONG_VIEC
  const insertTask = db.prepare(`
    INSERT INTO cong_viec (
      ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
      trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
      ma_nguoi_thuc_hien, ma_nguoi_tao, ma_nguoi_khoa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run('cv-01', 'da-dacs-01', 'moc-01', 'Khảo sát và lập bảng đặc tả yêu cầu chức năng (FR)', 'Hoàn thiện bảng đặc tả 8 use case chính và phân rã các bước tương tác tác tử.', 'hoan_thanh', 100.0, 1, '2026-09-20', 'u-sv-01', 'u-gv-01', 'u-gv-01');
  insertTask.run('cv-02', 'da-dacs-01', 'moc-01', 'Vẽ sơ đồ Use Case và Class Diagram phân tích', 'Đảm bảo tuân thủ quy tắc: thuộc tính là danh từ, phương thức là động từ hành động.', 'hoan_thanh', 100.0, 1, '2026-09-24', 'u-sv-02', 'u-sv-01', 'u-sv-01');
  insertTask.run('cv-03', 'da-dacs-01', 'moc-02', 'Tính toán phủ tối thiểu và tìm khóa bằng bao đóng', 'Tập Q gồm 20 thuộc tính A-W, chứng minh khóa chính duy nhất k = A.', 'hoan_thanh', 100.0, 1, '2026-10-05', 'u-sv-01', 'u-sv-01', 'u-gv-01');
  insertTask.run('cv-04', 'da-dacs-01', 'moc-02', 'Lập bảng Tableau 20x8 chứng minh Bảo toàn thông tin', 'Thuật toán Chase lấp đầy hàng R1 với các dấu tích, xác nhận không mất mát thông tin khi nối tự nhiên.', 'hoan_thanh', 100.0, 1, '2026-10-12', 'u-sv-02', 'u-sv-01', 'u-gv-01');
  insertTask.run('cv-05', 'da-dacs-01', 'moc-03', 'Xây dựng giao diện Demo Workspace theo TasteSkill v2', 'Bảng Kanban 4 cột, ngăn trượt chi tiết công việc, thanh chuyển vai trò để báo cáo GVHD.', 'dang_lam', 75.0, 0, '2026-10-25', 'u-sv-01', 'u-sv-01', null);
  insertTask.run('cv-06', 'da-dacs-01', 'moc-03', 'Đặc tả các Endpoint REST API tương ứng 9 bảng CSDL', 'Soạn thảo tài liệu API contract trong 04-thiet-ke-he-thong/02-api-du-kien.md.', 'dang_lam', 40.0, 0, '2026-10-28', 'u-sv-02', 'u-sv-01', null);
  insertTask.run('cv-07', 'da-dacs-01', 'moc-03', 'Soạn kịch bản trả lời phản biện cơ sở dữ liệu', 'Chuẩn bị các câu hỏi lý thuyết: tại sao có ma_do_an trong cong_viec, tại sao tách nguoi_dung và thanh_vien_nhom.', 'can_lam', 0.0, 0, '2026-10-30', 'u-sv-01', 'u-gv-01', null);
  insertTask.run('cv-08', 'da-dacs-01', 'moc-04', 'Khởi tạo cấu trúc dự án React và Express cục bộ', 'Chờ phê duyệt từ cổng duyệt CHO-DUYET.md trước khi chạy mã nguồn.', 'can_lam', 0.0, 0, '2026-11-05', 'u-sv-02', 'u-sv-01', null);
  insertTask.run('cv-09', 'da-dacs-01', 'moc-02', 'Rà soát định dạng font chữ Time New Roman trong biểu mẫu Word', 'Kiểm tra biểu mẫu theo dõi tiến độ tuần 1, tránh lỗi tràn bảng và không thẳng lề.', 'tre_han', 20.0, 0, '2026-10-14', 'u-sv-02', 'u-gv-01', null);

  // 7. BINH_LUAN
  const insertComment = db.prepare(`
    INSERT INTO binh_luan (ma_binh_luan, ma_cong_viec, ma_nguoi_dung, noi_dung)
    VALUES (?, ?, ?, ?)
  `);
  insertComment.run('bl-01', 'cv-05', 'u-gv-01', 'Giao diện demo cần thiết kế sạch sẽ, trực quan theo đúng cấu trúc bảng CSDL, không đưa các tính năng rườm rà vào.');
  insertComment.run('bl-02', 'cv-05', 'u-sv-01', 'Dạ thưa Thầy, nhóm em đã áp dụng bộ tokens chuẩn TasteSkill v2 với bề mặt phẳng 1px và màu sắc tối giản nhấn vào trạng thái công việc ạ.');
  insertComment.run('bl-03', 'cv-09', 'u-sv-02', 'Em đang chỉnh lại phần lề theo đúng hướng dẫn 2-2.5-3-2 cm của Khoa, hôm nay sẽ nộp lại Thầy xem.');

  // 8. TEP_DINH_KEM
  const insertFile = db.prepare(`
    INSERT INTO tep_dinh_kem (ma_tep, ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertFile.run('tep-01', 'cv-04', 'u-sv-01', '08-ket-qua-tinh-toan-viet-tay.md', '/uploads/08-ket-qua-tinh-toan-viet-tay.md', 'text/markdown', 6908);
  insertFile.run('tep-02', 'cv-05', 'u-sv-01', 'erd.drawio', '/uploads/erd.drawio', 'application/xml', 31602);

  // 9. THONG_BAO
  const insertNotification = db.prepare(`
    INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, ma_do_an, ma_cong_viec, loai_thong_bao, tieu_de, noi_dung, trang_thai_doc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotification.run('tb-01', 'u-sv-01', 'da-dacs-01', 'cv-05', 'nhac_nho_tien_do', 'GVHD Bùi Phú Khuyên đã nhắc nhở tiến độ', 'Chuẩn bị bản giao diện demo hoàn chỉnh trước buổi báo cáo tiến độ tuần.', 0);
  insertNotification.run('tb-02', 'u-sv-02', 'da-dacs-01', 'cv-09', 'canh_bao_tre_han', 'Cảnh báo: Công việc đã quá hạn chót', 'Công việc Rà soát biểu mẫu Word đã quá hạn ngày 14/10/2026.', 1);

  console.log('[DB] Đã nạp thành công dữ liệu khởi tạo vào 9 bảng SQLite!');
} else {
  console.log('[DB] CSDL đã tồn tại dữ liệu sẵn, không cần nạp lại.');
}

export function getDb() {
  return db;
}
