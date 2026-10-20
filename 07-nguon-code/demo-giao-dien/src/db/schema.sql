-- ==============================================================================
-- CƠ SỞ DỮ LIỆU SQLITE: HỆ THỐNG QUẢN LÝ CÔNG VIỆC VÀ TIẾN ĐỘ ĐỒ ÁN NHÓM
-- Bám sát 100% 9 bảng vật lý đã chuẩn hóa tại 03-csdl/07-schema-sql-du-kien.md
-- Toàn bộ tên bảng, tên cột dùng danh từ / cụm danh từ. Không thêm cột ngoài.
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Bảng NGUOI_DUNG
CREATE TABLE IF NOT EXISTS nguoi_dung (
  ma_nguoi_dung         TEXT PRIMARY KEY,
  email                 TEXT NOT NULL UNIQUE,
  mat_khau_bam          TEXT NOT NULL,
  ho_ten                TEXT NOT NULL,
  vai_tro_he_thong      TEXT NOT NULL CHECK (vai_tro_he_thong IN ('quantrivien', 'giangvien', 'sinhvien')),
  trang_thai_hoat_dong  INTEGER NOT NULL DEFAULT 1 CHECK (trang_thai_hoat_dong IN (0, 1)),
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Bảng DO_AN
CREATE TABLE IF NOT EXISTS do_an (
  ma_do_an              TEXT PRIMARY KEY,
  ten_do_an             TEXT NOT NULL,
  loai_do_an            TEXT NOT NULL CHECK (loai_do_an IN ('mon_hoc', 'co_so', 'chuyen_nganh')),
  ten_mon_hoc           TEXT,
  noi_dung_muc_tieu     TEXT,
  tien_do_tong          REAL NOT NULL DEFAULT 0.0 CHECK (tien_do_tong BETWEEN 0 AND 100),
  trang_thai            TEXT NOT NULL DEFAULT 'dang_thuc_hien' CHECK (trang_thai IN ('dang_thuc_hien', 'hoan_thanh', 'tam_dung', 'huy')),
  ma_giang_vien         TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Bảng NHOM (Quan hệ 1-1 với do_an)
CREATE TABLE IF NOT EXISTS nhom (
  ma_nhom               TEXT PRIMARY KEY,
  ma_do_an              TEXT NOT NULL UNIQUE REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_nhom              TEXT NOT NULL
);

-- 4. Bảng THANH_VIEN_NHOM
CREATE TABLE IF NOT EXISTS thanh_vien_nhom (
  ma_thanh_vien_nhom    TEXT PRIMARY KEY,
  ma_nhom               TEXT NOT NULL REFERENCES nhom(ma_nhom) ON DELETE CASCADE,
  ma_nguoi_dung         TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  vai_tro_trong_nhom    TEXT NOT NULL CHECK (vai_tro_trong_nhom IN ('nhom_truong', 'thanh_vien')),
  thoi_gian_tham_gia    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (ma_nhom, ma_nguoi_dung)
);

-- 5. Bảng MOC_TIEN_DO (Milestones)
CREATE TABLE IF NOT EXISTS moc_tien_do (
  ma_moc                TEXT PRIMARY KEY,
  ma_do_an              TEXT NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_moc               TEXT NOT NULL,
  han_hoan_thanh        TEXT,
  trang_thai            TEXT NOT NULL DEFAULT 'chua_hoan_thanh' CHECK (trang_thai IN ('chua_hoan_thanh', 'hoan_thanh', 'tre_han')),
  noi_dung_mo_ta        TEXT
);

-- 6. Bảng CONG_VIEC
CREATE TABLE IF NOT EXISTS cong_viec (
  ma_cong_viec          TEXT PRIMARY KEY,
  ma_do_an              TEXT NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ma_moc                TEXT NOT NULL REFERENCES moc_tien_do(ma_moc) ON DELETE CASCADE,
  tieu_de               TEXT NOT NULL,
  noi_dung_mo_ta        TEXT,
  trang_thai            TEXT NOT NULL CHECK (trang_thai IN ('can_lam', 'dang_lam', 'hoan_thanh', 'tre_han')),
  phan_tram_tien_do     REAL NOT NULL DEFAULT 0.0 CHECK (phan_tram_tien_do BETWEEN 0 AND 100),
  trang_thai_khoa       INTEGER NOT NULL DEFAULT 0 CHECK (trang_thai_khoa IN (0, 1)),
  han_chot              TEXT,
  ma_nguoi_thuc_hien    TEXT REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_nguoi_tao          TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_nguoi_khoa         TEXT REFERENCES nguoi_dung(ma_nguoi_dung),
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Bảng BINH_LUAN
CREATE TABLE IF NOT EXISTS binh_luan (
  ma_binh_luan          TEXT PRIMARY KEY,
  ma_cong_viec          TEXT NOT NULL REFERENCES cong_viec(ma_cong_viec) ON DELETE CASCADE,
  ma_nguoi_dung         TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  noi_dung              TEXT NOT NULL,
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Bảng TEP_DINH_KEM
CREATE TABLE IF NOT EXISTS tep_dinh_kem (
  ma_tep                TEXT PRIMARY KEY,
  ma_cong_viec          TEXT NOT NULL REFERENCES cong_viec(ma_cong_viec) ON DELETE CASCADE,
  ma_nguoi_dung         TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  ten_tep               TEXT NOT NULL,
  duong_dan_tep         TEXT NOT NULL,
  loai_tep              TEXT,
  dung_luong            INTEGER,
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Bảng THONG_BAO
CREATE TABLE IF NOT EXISTS thong_bao (
  ma_thong_bao          TEXT PRIMARY KEY,
  ma_nguoi_dung         TEXT NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
  ma_do_an              TEXT REFERENCES do_an(ma_do_an) ON DELETE SET NULL,
  ma_cong_viec          TEXT REFERENCES cong_viec(ma_cong_viec) ON DELETE SET NULL,
  loai_thong_bao        TEXT NOT NULL,
  tieu_de               TEXT NOT NULL,
  noi_dung              TEXT,
  trang_thai_doc        INTEGER NOT NULL DEFAULT 0 CHECK (trang_thai_doc IN (0, 1)),
  thoi_gian_tao         TEXT NOT NULL DEFAULT (datetime('now'))
);
