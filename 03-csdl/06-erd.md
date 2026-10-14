# Sơ đồ Thực thể Mối quan hệ (ERD - Sau chuẩn hóa)

> **Cách xem sơ đồ:** Xem trực tiếp trên giao diện GitHub hoặc sao chép mã dán vào trang [Mermaid Live Editor](https://mermaid.live).  
> **Quy chuẩn danh pháp:** 100% tên thực thể và tên thuộc tính đều sử dụng **Danh từ** hoặc **Cụm danh từ**.

```mermaid
erDiagram
  NGUOI_DUNG ||--o{ DO_AN : huong_dan
  NGUOI_DUNG ||--o{ THANH_VIEN_NHOM : tham_gia
  NGUOI_DUNG ||--o{ CONG_VIEC : thuc_hien
  NGUOI_DUNG ||--o{ CONG_VIEC : tao_viec
  NGUOI_DUNG ||--o{ BINH_LUAN : viet_binh_luan
  NGUOI_DUNG ||--o{ TEP_DINH_KEM : tai_len
  NGUOI_DUNG ||--o{ THONG_BAO : nhan_thong_bao

  DO_AN ||--|| NHOM : gan_voi
  DO_AN ||--o{ MOC_TIEN_DO : thiet_lap
  DO_AN ||--o{ CONG_VIEC : bao_gom
  DO_AN ||--o{ THONG_BAO : phat_sinh

  NHOM ||--o{ THANH_VIEN_NHOM : gom_co
  MOC_TIEN_DO ||--o{ CONG_VIEC : phan_chia
  CONG_VIEC ||--o{ BINH_LUAN : chua_thao_luan
  CONG_VIEC ||--o{ TEP_DINH_KEM : dinh_kem
  CONG_VIEC ||--o{ THONG_BAO : phat_sinh
  CONG_VIEC ||--o{ CONG_VIEC : phan_ra_thanh

  NGUOI_DUNG {
    uuid ma_nguoi_dung PK
    chuoi email UK
    chuoi mat_khau_bam
    chuoi ho_ten
    chuoi vai_tro_he_thong
    boolean trang_thai_hoat_dong
    ngay_gio thoi_gian_tao
  }

  DO_AN {
    uuid ma_do_an PK
    chuoi ten_do_an
    chuoi loai_do_an
    chuoi ten_mon_hoc
    chuoi noi_dung_muc_tieu
    so_thuc tien_do_tong
    chuoi trang_thai
    uuid ma_giang_vien FK
    ngay_gio thoi_gian_tao
  }

  NHOM {
    uuid ma_nhom PK
    uuid ma_do_an FK
    chuoi ten_nhom
  }

  THANH_VIEN_NHOM {
    uuid ma_thanh_vien_nhom PK
    uuid ma_nhom FK
    uuid ma_nguoi_dung FK
    chuoi vai_tro_trong_nhom
    ngay_gio thoi_gian_tham_gia
  }

  MOC_TIEN_DO {
    uuid ma_moc PK
    uuid ma_do_an FK
    chuoi ten_moc
    ngay han_hoan_thanh
    chuoi trang_thai
    chuoi noi_dung_mo_ta
  }

  CONG_VIEC {
    uuid ma_cong_viec PK
    uuid ma_do_an FK
    uuid ma_moc FK
    chuoi tieu_de
    chuoi noi_dung_mo_ta
    chuoi trang_thai
    so_thuc phan_tram_tien_do
    boolean trang_thai_khoa
    ngay_gio han_chot
    uuid ma_nguoi_thuc_hien FK
    uuid ma_nguoi_tao FK
    uuid ma_cong_viec_cha FK
    ngay_gio thoi_gian_tao
  }

  BINH_LUAN {
    uuid ma_binh_luan PK
    uuid ma_cong_viec FK
    uuid ma_nguoi_dung FK
    chuoi noi_dung
    ngay_gio thoi_gian_tao
  }

  TEP_DINH_KEM {
    uuid ma_tep PK
    uuid ma_cong_viec FK
    uuid ma_nguoi_dung FK
    chuoi ten_tep
    chuoi duong_dan_tep
    chuoi loai_tep
    so_nguyen dung_luong
    ngay_gio thoi_gian_tao
  }

  THONG_BAO {
    uuid ma_thong_bao PK
    uuid ma_nguoi_dung FK
    uuid ma_do_an FK
    uuid ma_cong_viec FK
    chuoi loai_thong_bao
    chuoi tieu_de
    chuoi noi_dung
    boolean trang_thai_doc
    ngay_gio thoi_gian_tao
  }
```

---

## Ghi chú các ràng buộc toàn vẹn
1. **Khóa ngoại và Ràng buộc duy nhất:**
   - Trường `NHOM.ma_do_an` có ràng buộc `UNIQUE` để bảo đảm mỗi đồ án chỉ có đúng 1 nhóm sinh viên thực hiện (quan hệ 1–1).
   - Bảng `THANH_VIEN_NHOM` có ràng buộc duy nhất trên cặp `(ma_nhom, ma_nguoi_dung)` để tránh trùng lặp sinh viên trong cùng một nhóm.
2. **Ký hiệu trên sơ đồ:**
   - `PK`: Khóa chính (Primary Key).
   - `FK`: Khóa ngoại (Foreign Key).
   - `UK`: Ràng buộc giá trị duy nhất (Unique Key).
