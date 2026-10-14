# Lược đồ Cơ sở dữ liệu SQL dự kiến (PostgreSQL)

> **Lưu ý:** Đây là tài liệu đặc tả cấu trúc bảng cơ sở dữ liệu vật lý (Data Definition Language - DDL) thuần Việt phục vụ báo cáo Đồ án cơ sở. Toàn bộ tên bảng và tên cột đều sử dụng **Danh từ / Cụm danh từ**.  
> **Chưa chạy migrate / chưa tạo cơ sở dữ liệu thật** cho đến khi thầy/cô hướng dẫn duyệt thông qua thiết kế và nhóm bắt đầu giai đoạn lập trình.

```sql
-- 1. Bảng NGUOI_DUNG (Lưu thông tin tài khoản người dùng trong hệ thống)
CREATE TABLE nguoi_dung (
  ma_nguoi_dung         UUID PRIMARY KEY,
  email                 VARCHAR(255) NOT NULL UNIQUE,
  mat_khau_bam          VARCHAR(255) NOT NULL,
  ho_ten                VARCHAR(255) NOT NULL,
  vai_tro_he_thong      VARCHAR(20) NOT NULL CHECK (vai_tro_he_thong IN ('quantrivien', 'giangvien', 'sinhvien')),
  trang_thai_hoat_dong  BOOLEAN NOT NULL DEFAULT TRUE,
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bảng DO_AN (Lưu thông tin đề tài đồ án)
CREATE TABLE do_an (
  ma_do_an              UUID PRIMARY KEY,
  ten_do_an             VARCHAR(500) NOT NULL,
  loai_do_an            VARCHAR(30) NOT NULL CHECK (loai_do_an IN ('mon_hoc', 'co_so', 'chuyen_nganh')),
  ten_mon_hoc           VARCHAR(255),
  noi_dung_muc_tieu     TEXT,
  tien_do_tong          NUMERIC(5,2) NOT NULL DEFAULT 0,
  trang_thai            VARCHAR(30) NOT NULL DEFAULT 'dang_thuc_hien',
  ma_giang_vien         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bảng NHOM (Nhóm sinh viên thực hiện đồ án - quan hệ 1-1 với đồ án)
CREATE TABLE nhom (
  ma_nhom               UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL UNIQUE REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_nhom              VARCHAR(255) NOT NULL
);

-- 4. Bảng THANH_VIEN_NHOM (Danh sách sinh viên trong nhóm và vai trò)
CREATE TABLE thanh_vien_nhom (
  ma_thanh_vien_nhom    UUID PRIMARY KEY,
  ma_nhom               UUID NOT NULL REFERENCES nhom(ma_nhom) ON DELETE CASCADE,
  ma_nguoi_dung         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  vai_tro_trong_nhom    VARCHAR(20) NOT NULL CHECK (vai_tro_trong_nhom IN ('nhom_truong', 'thanh_vien')),
  thoi_gian_tham_gia    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ma_nhom, ma_nguoi_dung)
);

-- 5. Bảng MOC_TIEN_DO (Các mốc bàn giao / Milestone quan trọng của đồ án)
CREATE TABLE moc_tien_do (
  ma_moc                UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_moc               VARCHAR(500) NOT NULL,
  han_hoan_thanh        DATE,
  trang_thai            VARCHAR(30) NOT NULL DEFAULT 'chua_hoan_thanh',
  noi_dung_mo_ta        TEXT
);

-- 6. Bảng CONG_VIEC (Các đầu việc cụ thể trong đồ án)
CREATE TABLE cong_viec (
  ma_cong_viec          UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ma_moc                UUID REFERENCES moc_tien_do(ma_moc),
  tieu_de               VARCHAR(500) NOT NULL,
  noi_dung_mo_ta        TEXT,
  trang_thai            VARCHAR(20) NOT NULL CHECK (trang_thai IN ('can_lam', 'dang_lam', 'hoan_thanh', 'tre_han')),
  phan_tram_tien_do     NUMERIC(5,2) NOT NULL DEFAULT 0,
  trang_thai_khoa       BOOLEAN NOT NULL DEFAULT FALSE,
  han_chot              TIMESTAMPTZ,
  ma_nguoi_thuc_hien    UUID REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_nguoi_tao          UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_nguoi_khoa         UUID REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_cong_viec_cha      UUID REFERENCES cong_viec(ma_cong_viec),
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Bảng BINH_LUAN (Trao đổi, thảo luận trên từng công việc)
CREATE TABLE binh_luan (
  ma_binh_luan          UUID PRIMARY KEY,
  ma_cong_viec          UUID NOT NULL REFERENCES cong_viec(ma_cong_viec) ON DELETE CASCADE,
  ma_nguoi_dung         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  noi_dung              TEXT NOT NULL,
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Bảng TEP_DINH_KEM (Tệp tài liệu đính kèm công việc)
CREATE TABLE tep_dinh_kem (
  ma_tep                UUID PRIMARY KEY,
  ma_cong_viec          UUID NOT NULL REFERENCES cong_viec(ma_cong_viec) ON DELETE CASCADE,
  ma_nguoi_dung         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  ten_tep               VARCHAR(500) NOT NULL,
  duong_dan_tep         VARCHAR(1000) NOT NULL,
  loai_tep              VARCHAR(255),
  dung_luong            BIGINT,
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Bảng THONG_BAO (Hộp thư thông báo gửi tới người dùng)
CREATE TABLE thong_bao (
  ma_thong_bao          UUID PRIMARY KEY,
  ma_nguoi_dung         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
  ma_do_an              UUID REFERENCES do_an(ma_do_an) ON DELETE SET NULL,
  ma_cong_viec          UUID REFERENCES cong_viec(ma_cong_viec) ON DELETE SET NULL,
  loai_thong_bao        VARCHAR(50) NOT NULL,
  tieu_de               VARCHAR(500) NOT NULL,
  noi_dung              TEXT,
  trang_thai_doc        BOOLEAN NOT NULL DEFAULT FALSE,
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Các ràng buộc toàn vẹn ứng dụng (Kiểm tra ở tầng nghiệp vụ)
1. Mỗi bản ghi trong bảng `nhom` bắt buộc có đúng một thành viên có vai trò `vai_tro_trong_nhom = 'nhom_truong'`.
2. Sinh viên được gán làm người thực hiện công việc (`ma_nguoi_thuc_hien`) bắt buộc phải có tên trong bảng `thanh_vien_nhom` của nhóm phụ trách đồ án đó.
3. Khi cờ `trang_thai_khoa = TRUE`, hệ thống không cho phép người thực hiện tự ý chỉnh sửa giá trị `phan_tram_tien_do` trừ khi được mở khóa bởi Nhóm trưởng hoặc Giảng viên hướng dẫn.
