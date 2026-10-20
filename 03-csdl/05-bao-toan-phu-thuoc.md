# Kiểm tra Bảo toàn Phụ thuộc hàm (Dependency Preservation)

## 1. Mục tiêu chứng minh
Sau khi phân rã lược đồ quan hệ tổng quát Q thành tập các lược đồ con Ri, tập hợp các phụ thuộc hàm được bảo toàn trên từng quan hệ con phải tương đương với tập phụ thuộc hàm ban đầu F:

(π_R1(F) ∪ π_R2(F) ∪ ... ∪ π_Rn(F))+ = F+

Điều này đảm bảo mọi quy tắc nghiệp vụ đều có thể được kiểm tra cục bộ ngay trên từng bảng đơn lẻ thông qua ràng buộc khóa chính (`PRIMARY KEY`) hoặc ràng buộc duy nhất (`UNIQUE`), mà không cần phải thực hiện phép kết nối (`JOIN`) nhiều bảng tốn kém tài nguyên.

---

## 2. Bảng đối chiếu giữa Phụ thuộc hàm và Bảng CSDL vật lý (SQL DDL)

| Ký hiệu | Dạng biểu diễn chữ cái | Biểu diễn thuộc tính thực tế | Bảng CSDL vật lý chứa | Cơ chế kiểm tra (Enforce) trên CSDL |
|:---:|---|---|:---:|---|
| f1 | A → B, C, D, E, G, P, U, W | `ma_cong_viec → tieu_de, trang_thai, %, khoa, han_chot, nguoi_lam, moc, nguoi_tao` | `cong_viec` | Khóa chính `PK(ma_cong_viec)`. *(Ghi chú: han_chot và ma_nguoi_thuc_hien nullable trong SQL để hỗ trợ việc chưa gán / deadline mở)* |
| f2 | H → I, J, K (kèm H → M) | `ma_do_an → ten_do_an, loai_do_an, ma_giang_vien` (kèm `ma_nhom`) | `do_an` & `nhom` | `H → I, J, K` kiểm tra qua `PK(ma_do_an)` trên `do_an`. Còn `H → M` kiểm tra qua ràng buộc `UNIQUE(ma_do_an)` trên bảng `nhom` |
| f3 | M → N, H | `ma_nhom → ten_nhom, ma_do_an` | `nhom` | Khóa chính `PK(ma_nhom)` trên bảng `nhom` |
| f4 | P → S, T | `ma_nguoi_thuc_hien → ten_nguoi_thuc_hien, email` | `nguoi_dung` | Khóa chính `PK(ma_nguoi_dung)` trên bảng `nguoi_dung` |
| f5 | T → P | `email → ma_nguoi_dung` | `nguoi_dung` | Ràng buộc duy nhất `UNIQUE(email)` trên bảng `nguoi_dung` |
| f6 | K → L | `ma_giang_vien → ten_giang_vien` | `nguoi_dung` | Khóa chính `PK(ma_nguoi_dung)` trên `nguoi_dung` với điều kiện `vai_tro_he_thong = 'giangvien'` |
| f7 | U → V, H | `ma_moc → ten_moc, ma_do_an` | `moc_tien_do` | Khóa chính `PK(ma_moc)` trên bảng `moc_tien_do` |
| f8 | (M, P) → R | `(ma_nhom, ma_nguoi_dung) → vai_tro_trong_nhom` | `thanh_vien_nhom` | Ràng buộc duy nhất `UNIQUE(ma_nhom, ma_nguoi_dung)` |

### Ánh xạ bảng lý thuyết sang bảng CSDL vật lý:
1. **`NGUOI_THUC_HIEN(P, S, T)` và `GIANG_VIEN(K, L)`:** Trong CSDL vật lý (SQL DDL), hai thực thể này được gộp chung vào bảng `nguoi_dung(ma_nguoi_dung, ho_ten, email, vai_tro_he_thong)` để quản lý đăng nhập tập trung.
2. **`DO_AN` và `NHOM`:** Trong SQL, bảng `nhom` chứa khóa ngoại `ma_do_an UNIQUE REFERENCES do_an(ma_do_an)`. Do đó, `f2` (H → M) và `f3` (M → H) được kiểm tra hoàn toàn bằng các ràng buộc PK và UNIQUE của hệ quản trị CSDL.

---

## 3. Ràng buộc toàn vẹn ngữ nghĩa liên quan hệ (Cross-table Constraints)
Bên cạnh các phụ thuộc hàm cục bộ được đảm bảo qua khóa chính và khóa duy nhất ở trên, hệ thống có hai ràng buộc nghiệp vụ liên quan hệ quan trọng:
1. **Ràng buộc thành viên nhóm:**
   - Nghiệp vụ: "Sinh viên được phân công làm việc (`ma_nguoi_thuc_hien`) bắt buộc phải là thành viên có trong bảng `thanh_vien_nhom` của nhóm thực hiện đồ án đó."
   - Cơ chế kiểm soát: Kiểm tra tự động tại tầng dịch vụ backend API trước khi lưu công việc.
2. **Ràng buộc nhất quán Denormalization `(ma_do_an, ma_moc)`:**
   - Do bảng `cong_viec` lưu trực tiếp cả `ma_do_an` (để tối ưu truy vấn) và `ma_moc`, hệ thống cần đảm bảo `cong_viec.ma_do_an` phải khớp chính xác với `moc_tien_do.ma_do_an`.
   - Cơ chế kiểm soát: Kiểm tra ở tầng dịch vụ hoặc dùng Trigger trên PostgreSQL.

---

## 4. Kết luận
- Toàn bộ các phụ thuộc hàm fi trong tập phủ tối thiểu F đều được bảo toàn trực tiếp trên từng bảng CSDL vật lý thông qua khóa chính (`PRIMARY KEY`) hoặc khóa duy nhất (`UNIQUE`).
- Khẳng định kết luận: Quá trình phân rã và chuẩn hóa cơ sở dữ liệu hoàn toàn **đạt tính chất bảo toàn phụ thuộc hàm (Dependency Preservation)**.
