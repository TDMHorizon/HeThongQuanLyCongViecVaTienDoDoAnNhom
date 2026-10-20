# Lược đồ Cơ sở dữ liệu SQL dự kiến (PostgreSQL)

> **Lưu ý:** Đây là tài liệu đặc tả cấu trúc bảng cơ sở dữ liệu vật lý (Data Definition Language - DDL) thuần Việt phục vụ báo cáo Đồ án cơ sở. Toàn bộ tên bảng và tên cột đều sử dụng **Danh từ / Cụm danh từ**.  
> **Chưa chạy migrate / chưa tạo cơ sở dữ liệu thật** cho đến khi thầy/cô hướng dẫn duyệt thông qua thiết kế và nhóm bắt đầu giai đoạn lập trình.

```sql
-- 1. Bảng NGUOI_DUNG (Lưu thông tin tài khoản người dùng trong hệ thống)
-- Đóng vai trò thống nhất cho cả Giảng viên hướng dẫn (K) và Sinh viên / Người thực hiện (P)
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
-- Phân rã theo chuẩn: DO_AN(H, I, J, K) với ma_do_an (H) là khóa chính
CREATE TABLE do_an (
  ma_do_an              UUID PRIMARY KEY,
  ten_do_an             VARCHAR(500) NOT NULL,
  loai_do_an            VARCHAR(30) NOT NULL CHECK (loai_do_an IN ('mon_hoc', 'co_so', 'chuyen_nganh')),
  ten_mon_hoc           VARCHAR(255),
  noi_dung_muc_tieu     TEXT,
  tien_do_tong          NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (tien_do_tong BETWEEN 0 AND 100),
  trang_thai            VARCHAR(30) NOT NULL DEFAULT 'dang_thuc_hien' CHECK (trang_thai IN ('dang_thuc_hien', 'hoan_thanh', 'tam_dung', 'huy')),
  ma_giang_vien         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  thoi_gian_tao         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bảng NHOM (Nhóm sinh viên thực hiện đồ án - quan hệ 1-1 với đồ án)
-- Phân rã theo chuẩn: NHOM(M, N, H) với ma_nhom (M) là PK, ma_do_an (H) là UNIQUE ép chặt quan hệ 1-1
CREATE TABLE nhom (
  ma_nhom               UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL UNIQUE REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_nhom              VARCHAR(255) NOT NULL
);

-- 4. Bảng THANH_VIEN_NHOM (Danh sách sinh viên trong nhóm và vai trò)
-- Phân rã theo chuẩn: THANH_VIEN_NHOM(M, P, R) với PK là cặp (ma_nhom, ma_nguoi_dung)
CREATE TABLE thanh_vien_nhom (
  ma_thanh_vien_nhom    UUID PRIMARY KEY,
  ma_nhom               UUID NOT NULL REFERENCES nhom(ma_nhom) ON DELETE CASCADE,
  ma_nguoi_dung         UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  vai_tro_trong_nhom    VARCHAR(20) NOT NULL CHECK (vai_tro_trong_nhom IN ('nhom_truong', 'thanh_vien')),
  thoi_gian_tham_gia    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ma_nhom, ma_nguoi_dung)
);

-- 5. Bảng MOC_TIEN_DO (Các mốc bàn giao / Milestone quan trọng của đồ án)
-- Phân rã theo chuẩn: MOC(U, V, H) với ma_moc (U) là PK, ma_do_an (H) là FK
CREATE TABLE moc_tien_do (
  ma_moc                UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ten_moc               VARCHAR(500) NOT NULL,
  han_hoan_thanh        DATE,
  trang_thai            VARCHAR(30) NOT NULL DEFAULT 'chua_hoan_thanh' CHECK (trang_thai IN ('chua_hoan_thanh', 'hoan_thanh', 'tre_han')),
  noi_dung_mo_ta        TEXT
);

-- 6. Bảng CONG_VIEC (Các đầu việc cụ thể trong đồ án)
-- Phân rã theo chuẩn: CONG_VIEC(A, B, C, D, E, G, P, U, W)
-- Ghi chú: Cột ma_do_an (H) được giữ lại có chủ ý (Denormalization) để tối ưu truy vấn đồ án mà không phải JOIN qua moc_tien_do
CREATE TABLE cong_viec (
  ma_cong_viec          UUID PRIMARY KEY,
  ma_do_an              UUID NOT NULL REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
  ma_moc                UUID NOT NULL REFERENCES moc_tien_do(ma_moc) ON DELETE CASCADE,
  tieu_de               VARCHAR(500) NOT NULL,
  noi_dung_mo_ta        TEXT,
  trang_thai            VARCHAR(20) NOT NULL CHECK (trang_thai IN ('can_lam', 'dang_lam', 'hoan_thanh', 'tre_han')),
  phan_tram_tien_do     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (phan_tram_tien_do BETWEEN 0 AND 100),
  trang_thai_khoa       BOOLEAN NOT NULL DEFAULT FALSE,
  han_chot              TIMESTAMPTZ, -- Cho phép NULL khi việc mới tạo chưa chốt deadline cụ thể
  ma_nguoi_thuc_hien    UUID REFERENCES nguoi_dung(ma_nguoi_dung), -- Cho phép NULL khi việc chưa phân công (Unassigned Task)
  ma_nguoi_tao          UUID NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
  ma_nguoi_khoa         UUID REFERENCES nguoi_dung(ma_nguoi_dung), -- Thuộc tính nhật ký phụ trợ đi kèm cờ trang_thai_khoa
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

## Các ràng buộc toàn vẹn ứng dụng và lưu ý vật lý

1. **Ràng buộc nhất quán cặp (ma_do_an, ma_moc) trong `cong_viec`:**
   - Do có kỹ thuật Denormalization lưu thẳng `ma_do_an` vào `cong_viec`, hệ thống cần đảm bảo `cong_viec.ma_do_an` luôn trùng khớp với `moc_tien_do.ma_do_an`.
   - Cơ chế kiểm soát: Được kiểm tra tự động tại tầng dịch vụ backend (Backend Validation Middleware) trước khi thêm/sửa công việc, hoặc thông qua ràng buộc ngoại phức hợp `FOREIGN KEY (ma_moc, ma_do_an) REFERENCES moc_tien_do(ma_moc, ma_do_an)`.

2. **Ràng buộc phân công thành viên:**
   - Người thực hiện (`ma_nguoi_thuc_hien`) nếu khác NULL thì bắt buộc phải là thành viên có tên trong bảng `thanh_vien_nhom` của nhóm đang thực hiện đồ án đó.

3. **Ghi chú về giá trị NULL và phụ thuộc hàm lý thuyết:**
   - Trong lý thuyết chuẩn hóa, phụ thuộc hàm `f1: A → P` và `A → G` được hiểu là xét trên tập các bản ghi công việc đã được phân công và đã định hạn chót.
   - Trong CSDL vật lý thực tế, cho phép `NULL` để hỗ trợ trạng thái công việc chờ gán (Backlog / Unassigned) và công việc mở chưa có deadline cố định.
