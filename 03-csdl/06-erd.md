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

## Ghi chú các ràng buộc toàn vẹn và ánh xạ vật lý
1. **Quan hệ 1–1 giữa Đồ án và Nhóm:**
   - Trường `NHOM.ma_do_an` có ràng buộc `UNIQUE` và là khóa ngoại tham chiếu tới `DO_AN(ma_do_an)` để đảm bảo mỗi đồ án chỉ gắn với duy nhất 1 nhóm sinh viên (và ngược lại).
2. **Kỹ thuật Denormalization trên thực thể CONG_VIEC:**
   - Thuộc tính `ma_do_an` được lưu trực tiếp trong `CONG_VIEC` (song song với `ma_moc`) nhằm tăng tốc độ truy vấn danh sách công việc theo đồ án mà không phải nối bảng trung gian `MOC_TIEN_DO`. Về mặt lý thuyết chuẩn hóa thuần túy, `CONG_VIEC` chỉ cần thuộc tính `ma_moc` do đã có phụ thuộc hàm `ma_moc → ma_do_an`.
3. **Thực thể hợp nhất NGUOI_DUNG:**
   - Trong mô hình CSDL vật lý, hai thực thể lý thuyết `NGUOI_THUC_HIEN` (sinh viên) và `GIANG_VIEN` được hợp nhất vào bảng dùng chung `NGUOI_DUNG` và phân định bằng thuộc tính `vai_tro_he_thong`.
4. **Ký hiệu trên sơ đồ:**
   - `PK`: Khóa chính (Primary Key).
   - `FK`: Khóa ngoại (Foreign Key).
   - `UK`: Ràng buộc giá trị duy nhất (Unique Key).
