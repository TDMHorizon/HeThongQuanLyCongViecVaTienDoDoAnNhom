# Kiểm tra Bảo toàn Phụ thuộc hàm (Dependency Preservation)

## 1. Mục tiêu chứng minh
Sau khi phân rã lược đồ quan hệ tổng thể Q thành các lược đồ con Ri, tập hợp các phụ thuộc hàm được bảo toàn trên từng quan hệ con phải tương đương với tập phụ thuộc hàm ban đầu F:

(Hợp của các phép chiếu phụ thuộc hàm trên các bảng con)+ = F+

Điều này đảm bảo mọi quy tắc nghiệp vụ đều có thể được kiểm tra cục bộ ngay trên từng bảng đơn lẻ thông qua ràng buộc khóa chính (PRIMARY KEY) hoặc khóa duy nhất (UNIQUE), mà không cần thực hiện phép kết nối (JOIN) nhiều bảng tốn kém tài nguyên.

---

## 2. Bảng đối chiếu giữa Phụ thuộc hàm và Lược đồ con
Dựa trên tập phụ thuộc hàm F = {f1, f2, f3, f4, f5, f6} và các phụ thuộc hàm độc lập đã định nghĩa trong [02-phu-thuoc-ham.md](file:///d:/QTCuaTruc/DuAn/File%20MauDoDan/892818388Bieu%20mau%20Do%20an%20Co%20so/Bieu%20mau%20Do%20an%20Co%20so/He-thong-quan-ly-cong-viec-va-tien-do-do-an-nhom/03-csdl/02-phu-thuoc-ham.md):

| Ký hiệu | Dạng biểu diễn chữ cái | Biểu diễn thuộc tính thực tế | Lược đồ con chứa phụ thuộc hàm | Cơ chế kiểm tra (Enforce) |
|:---:|---|---|:---:|---|
| f1 | A → B, C, D, E, G, H, P, U, W | `ma_cong_viec → tieu_de, trang_thai, % , khoa, han_chot, do_an, ...` | R1 (`CONG_VIEC`) | Khóa chính PK (A) |
| f2 | H → I, J, K, M | `ma_do_an → ten_do_an, loai_do_an, ma_giang_vien, ma_nhom` | R2 (`DO_AN`) | Khóa chính PK (H) |
| f3 | M → N, H | `ma_nhom → ten_nhom, ma_do_an` | `NHOM` | Khóa chính PK (M) & `UNIQUE(H)` |
| f4 | P → S, T | `ma_nguoi_thuc_hien → ten_nguoi_thuc_hien, email_nguoi_thuc_hien` | `NGUOI_DUNG` | Khóa chính PK (P) |
| f5 | K → L | `ma_giang_vien → ten_giang_vien` | `NGUOI_DUNG` | Khóa chính PK (K) |
| f6 | U → V, H | `ma_moc → ten_moc, ma_do_an` | R4 (`MOC_TIEN_DO`) | Khóa chính PK (U) |
| f7 | A_ND → B_ND, C_ND, D_ND, E_ND, G_ND, H_ND | `ma_nguoi_dung → email, mat_khau, ho_ten, vai_tro, ...` | `NGUOI_DUNG` | Khóa chính PK (A_ND) & `UNIQUE(B_ND)` |
| f8 | (B2, B3) → B4, B5 | `(ma_nhom, ma_nguoi_dung) → vai_tro_trong_nhom, thoi_gian` | `THANH_VIEN_NHOM` | Ràng buộc duy nhất `UNIQUE(B2, B3)` |
| f9 | C1 → C2, C3, C4, C5 | `ma_binh_luan → ma_cong_viec, ma_nguoi_dung, noi_dung, ...` | `BINH_LUAN` | Khóa chính PK (C1) |
| f10 | D1 → D2, D3, D4, D5, D6, D7, D8 | `ma_tep → ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan, ...` | `TEP_DINH_KEM` | Khóa chính PK (D1) |
| f11 | E1 → E2, E3, E4, E5, E6, E7, E8, E9 | `ma_thong_bao → ma_nguoi_dung, tieu_de, noi_dung, ...` | `THONG_BAO` | Khóa chính PK (E1) |

---

## 3. Ràng buộc ngữ nghĩa liên quan hệ (Inter-relational Constraint)
Bên cạnh các phụ thuộc hàm cục bộ được đảm bảo qua khóa chính và khóa duy nhất ở trên, hệ thống có một ràng buộc nghiệp vụ liên quan hệ quan trọng:
- Nghiệp vụ: "Sinh viên được phân công làm việc (P) bắt buộc phải là thành viên thuộc nhóm (M) thực hiện đồ án (H)."
- Cơ chế thực thi: 
  - Đây là ràng buộc toàn vẹn tham chiếu chéo (Cross-table Referential Integrity), được kiểm tra tự động tại tầng dịch vụ ứng dụng (API Backend Middleware) trước khi thêm/sửa công việc.
  - Có thể sử dụng Trigger `BEFORE INSERT OR UPDATE ON cong_viec` trên PostgreSQL để bảo vệ toàn vẹn tuyệt đối ở tầng cơ sở dữ liệu.

---

## 4. Kết luận
- Mọi phụ thuộc hàm fi thuộc F đều được bảo toàn trực tiếp trên ít nhất một lược đồ con xác định thông qua khóa chính (PRIMARY KEY) hoặc khóa duy nhất (UNIQUE).
- Khẳng định kết luận: Quá trình chuẩn hóa cơ sở dữ liệu hoàn toàn **đạt tính chất bảo toàn phụ thuộc hàm (Dependency Preservation)**.
