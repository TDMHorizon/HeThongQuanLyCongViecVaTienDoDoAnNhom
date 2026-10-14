# Quá trình Chuẩn hóa Cơ sở dữ liệu

## Bước 0: Lược đồ ban đầu chưa chuẩn hóa (UNF / Quan hệ rộng)
Xét lược đồ quan hệ tổng quát Q và tập phụ thuộc hàm F đã được mô hình hóa trong [02-phu-thuoc-ham.md](file:///d:/QTCuaTruc/DuAn/File%20MauDoDan/892818388Bieu%20mau%20Do%20an%20Co%20so/Bieu%20mau%20Do%20an%20Co%20so/He-thong-quan-ly-cong-viec-va-tien-do-do-an-nhom/03-csdl/02-phu-thuoc-ham.md):

Q = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, S, T, U, V, W}

Trong đó:
- A: `ma_cong_viec` (Khóa chính)
- B: `tieu_de_cv`, C: `trang_thai_cv`, D: `phan_tram_tien_do`, E: `trang_thai_khoa`, G: `han_chot_cv`
- H: `ma_do_an`, I: `ten_do_an`, J: `loai_do_an`, K: `ma_giang_vien`, L: `ten_giang_vien`
- M: `ma_nhom`, N: `ten_nhom`
- P: `ma_nguoi_thuc_hien`, S: `ten_nguoi_thuc_hien`, T: `email_nguoi_thuc_hien`
- U: `ma_moc`, V: `ten_moc`
- W: `ma_nguoi_tao`

Hạn chế: Lặp lại thông tin giảng viên (K, L), sinh viên (P, S, T), đồ án (H, I, J), nhóm (M, N) trên từng dòng công việc A, gây dư thừa và sai sót dữ liệu khi cập nhật.

---

## 1. Dạng chuẩn 1 (1NF)
- Định nghĩa: Một lược đồ quan hệ đạt 1NF nếu và chỉ nếu tất cả các miền giá trị của các thuộc tính đều chỉ chứa các giá trị nguyên tử (atomic value), không chứa thuộc tính đa trị hoặc nhóm lặp.
- Đánh giá: Mỗi thuộc tính từ A đến W trong Q đều là các trường dữ liệu đơn lẻ (chuỗi, số, ngày giờ, đúng/sai), không có trường mảng hay lặp.
- Kết luận: Lược đồ Q đã **đạt dạng chuẩn 1 (1NF)**.

---

## 2. Dạng chuẩn 2 (2NF)
- Định nghĩa: Một lược đồ quan hệ đạt 2NF nếu đã đạt 1NF và mọi thuộc tính không khóa đều phụ thuộc hàm **đầy đủ** vào khóa chính (nghĩa là không tồn tại thuộc tính không khóa nào phụ thuộc vào một tập con thực sự của khóa chính).
- Phân tích: 
  - Khóa chính của Q là thuộc tính đơn: Khóa chính = {A}.
  - Do khóa chính chỉ có duy nhất 1 thuộc tính (A) nên không thể có tập con thực sự của khóa chính. Vì vậy, không tồn tại bất kỳ sự vi phạm phụ thuộc hàm từng phần nào.
  - Tuy nhiên, trong Q tồn tại các thuộc tính không khóa phụ thuộc vào các thuộc tính không khóa khác (phụ thuộc bắc cầu), cần giải quyết ở 2NF và 3NF thông qua phép phân rã.
- Phân rã sơ bộ theo các thực thể độc lập:
  1. CONG_VIEC (Q1): {A, B, C, D, E, G, H, P, U, W} với khóa chính A.
  2. DO_AN (Q2): {H, I, J, K} với khóa chính H.
  3. NHOM (Q3): {M, N, H} với khóa chính M (ràng buộc H là UNIQUE).
  4. NGUOI_DUNG (Người thực hiện): {P, S, T} với khóa chính P.
  5. NGUOI_DUNG (Giảng viên): {K, L} với khóa chính K.
  6. MOC_TIEN_DO (Q4): {U, V, H} với khóa chính U.
- Kết luận: Mọi thuộc tính không khóa trong các quan hệ con đều phụ thuộc đầy đủ vào khóa của quan hệ đó -> **Đạt dạng chuẩn 2 (2NF)**.

---

## 3. Dạng chuẩn 3 (3NF)
- Định nghĩa: Một lược đồ quan hệ đạt 3NF nếu đã đạt 2NF và không có thuộc tính không khóa nào phụ thuộc **bắc cầu** vào khóa chính. Nghĩa là với mọi phụ thuộc hàm không tầm thường X → Y, thì:
  - X phải là một siêu khóa (Superkey), hoặc
  - Y là thuộc tính khóa (Prime attribute).
- Kiểm tra loại bỏ phụ thuộc bắc cầu:
  - Trong lược đồ ban đầu Q, ta có các phụ thuộc bắc cầu:
    - A → H và H → I, J, K  => A → I, J, K (vi phạm 3NF vì H không phải siêu khóa của Q).
    - A → P và P → S, T      => A → S, T (vi phạm 3NF vì P không phải siêu khóa của Q).
    - H → K và K → L         => H → L (vi phạm 3NF vì K không phải siêu khóa của Q).
    - A → U và U → V         => A → V (vi phạm 3NF vì U không phải siêu khóa của Q).
  - Biện pháp tách:
    - Loại bỏ I, J, K khỏi quan hệ công việc, chỉ giữ lại khóa ngoại H (`ma_do_an`).
    - Loại bỏ S, T khỏi quan hệ công việc, chỉ giữ lại khóa ngoại P (`ma_nguoi_thuc_hien`).
    - Loại bỏ L khỏi quan hệ đồ án, chỉ giữ lại khóa ngoại K (`ma_giang_vien`).
    - Loại bỏ V khỏi quan hệ công việc, chỉ giữ lại khóa ngoại U (`ma_moc`).
- Danh sách các lược đồ quan hệ hoàn chỉnh sau khi đạt 3NF:
  1. `CONG_VIEC` = {A, B, C, D, E, G, H, P, U, W}  
     *(Khóa chính: A — `ma_cong_viec`)*
  2. `DO_AN` = {H, I, J, K}  
     *(Khóa chính: H — `ma_do_an`)*
  3. `NHOM` = {M, N, H}  
     *(Khóa chính: M — `ma_nhom`, H — `ma_do_an` là UNIQUE)*
  4. `MOC_TIEN_DO` = {U, V, H}  
     *(Khóa chính: U — `ma_moc`)*
  5. `NGUOI_DUNG` = {A_ND, B_ND, C_ND, D_ND, E_ND, G_ND, H_ND}  
     *(Khóa chính: A_ND — `ma_nguoi_dung`, bao gồm cả Giảng viên K và Người thực hiện P)*
  6. `THANH_VIEN_NHOM` = {B1, B2, B3, B4, B5}  
     *(Khóa chính: B1 — `ma_thanh_vien_nhom`, UNIQUE (B2, B3))*
  7. `BINH_LUAN` = {C1, C2, C3, C4, C5}  
     *(Khóa chính: C1 — `ma_binh_luan`)*
  8. `TEP_DINH_KEM` = {D1, D2, D3, D4, D5, D6, D7, D8}  
     *(Khóa chính: D1 — `ma_tep`)*
  9. `THONG_BAO` = {E1, E2, E3, E4, E5, E6, E7, E8, E9}  
     *(Khóa chính: E1 — `ma_thong_bao`)*
- Kết luận: Tất cả các phụ thuộc hàm trong từng lược đồ con đều có vế trái là siêu khóa -> **Đạt dạng chuẩn 3 (3NF)**.

---

## 4. Dạng chuẩn Boyce-Codd (BCNF)
- Định nghĩa: Một lược đồ quan hệ đạt BCNF nếu mọi phụ thuộc hàm không tầm thường X → Y thì X bắt buộc phải là một siêu khóa.
- Đánh giá: Trong tất cả 9 quan hệ con ở trên:
  - Ở `CONG_VIEC`: Duy nhất A → các thuộc tính còn lại (A là khóa chính).
  - Ở `DO_AN`: Duy nhất H → I, J, K (H là khóa chính).
  - Ở `NHOM`: M → N, H và H → M, N (cả M và H đều là khóa ứng viên).
  - Tương tự với các bảng còn lại, mọi vế trái của các phụ thuộc hàm đều là siêu khóa.
- Kết luận: Cơ sở dữ liệu hoàn toàn **đạt chuẩn Boyce-Codd (BCNF)**.
