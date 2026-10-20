# Kiểm tra Bảo toàn Thông tin (Lossless Join)

## 1. Mục tiêu chứng minh
Sau khi phân rã lược đồ quan hệ tổng quát Q thành tập các lược đồ con khớp hoàn toàn với thiết kế CSDL vật lý (SQL DDL và ERD):
- `R1` (CONG_VIEC): {A, B, C, D, E, G, P, U, W}
- `R2` (MOC): {U, V, H}
- `R3` (DO_AN): {H, I, J, K}
- `R4` (NHOM): {M, N, H} *(Khóa chính M, ma_do_an H là UNIQUE)*
- `R5` (NGUOI_DUNG): {ma_nguoi_dung, ho_ten, email} *(Gộp Người thực hiện P, S, T và Giảng viên K, L)*
- `R6` (THANH_VIEN_NHOM): {M, P, R}

Phép nối tự nhiên (Natural Join) của tất cả các lược đồ con này phải **không làm mất mát thông tin và không sinh ra các bộ thừa giả mạo (Spurious Tuples)**:

R1 ⋈ R2 ⋈ R3 ⋈ R4 ⋈ R5 ⋈ R6 = Q

> **Ghi chú về Denormalization trong CSDL vật lý:**  
> Trong bảng `cong_viec` của SQL/ERD, ta lưu thêm thuộc tính `ma_do_an` (H). Đây là kỹ thuật phi chuẩn hóa (Denormalization) có chủ ý nhằm giúp câu lệnh truy vấn công việc theo đồ án đạt hiệu năng cao mà không cần JOIN qua `moc_tien_do`. Về mặt lý thuyết chuẩn hóa thuần túy, R1 chỉ cần thuộc tính `ma_moc` (U) vì đã có `U → H`.

---

## 2. Ký hiệu các lược đồ con phân rã theo thiết kế SQL/ERD

- **R1 (CONG_VIEC):** {A, B, C, D, E, G, P, U, W} — Khóa chính: A
- **R2 (MOC):** {U, V, H} — Khóa chính: U
- **R3 (DO_AN):** {H, I, J, K} — Khóa chính: H
- **R4 (NHOM):** {M, N, H} — Khóa chính: M; Khóa duy nhất (UNIQUE): H
- **R5 (NGUOI_DUNG):** {ma_nguoi_dung, ho_ten, email} — Khóa chính: ma_nguoi_dung; Khóa dự tuyển: email
- **R6 (THANH_VIEN_NHOM):** {M, P, R} — Khóa chính: Cặp (M, P)

---

## 3. Chứng minh bằng Định lý Phân rã Nhị phân lặp
**Định lý:** Phép phân rã một lược đồ quan hệ R thành hai lược đồ con RA và RB là bảo toàn thông tin đối với tập phụ thuộc hàm F khi và chỉ khi:  
`(RA ∩ RB → RA) thuộc F+`  hoặc  `(RA ∩ RB → RB) thuộc F+`  
*(Nghĩa là tập thuộc tính giao nhau phải là một siêu khóa của ít nhất một trong hai lược đồ con).*

### Các bước chứng minh tuần tự khớp với thiết kế CSDL:

#### Bước 1: Nối R1 (CONG_VIEC) và R2 (MOC) qua thuộc tính U
- Giao thuộc tính:  
  `R1 ∩ R2 = {A, B, C, D, E, G, P, U, W} ∩ {U, V, H} = {U}`
- Xét thuộc tính chung U (`ma_moc`):
  - Ta có phụ thuộc hàm `f7: U → V, H`, suy ra `U → R2`.
  - Vì U là khóa chính của R2 (MOC), nên `{U}` là siêu khóa của R2.
- **Kết luận Bước 1:** Phép nối (R1 ⋈ R2) là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R12 = R1 ∪ R2 = {A, B, C, D, E, G, H, P, U, V, W}.

#### Bước 2: Nối tiếp kết quả R12 với R3 (DO_AN) qua thuộc tính H
- Giao thuộc tính:  
  `R12 ∩ R3 = {A, B, C, D, E, G, H, P, U, V, W} ∩ {H, I, J, K} = {H}`
- Xét thuộc tính chung H (`ma_do_an`):
  - Ta có phụ thuộc hàm `f2: H → I, J, K`, suy ra `H → R3`.
  - Vì H là khóa chính của R3 (DO_AN), nên `{H}` là siêu khóa của R3.
- **Kết luận Bước 2:** Phép nối tiếp là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R123 = R12 ∪ R3 = {A, B, C, D, E, G, H, I, J, K, P, U, V, W}.

#### Bước 3: Nối tiếp kết quả R123 với R4 (NHOM) qua thuộc tính H
- Giao thuộc tính:  
  `R123 ∩ R4 = { ... } ∩ {M, N, H} = {H}`
- Xét thuộc tính chung H (`ma_do_an`):
  - Trong bảng `NHOM(M, N, H)`, vì ràng buộc `UNIQUE(H)` (mô hình 1 đồ án = 1 nhóm), ta có phụ thuộc hàm `H → M`. Kết hợp với `M → N`, suy ra `H → M, N` tức là `H → R4`.
  - Do đó, `{H}` là một siêu khóa (Candidate Key) của R4 (NHOM).
- **Kết luận Bước 3:** Phép nối tiếp là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R1234 = R123 ∪ R4 = {A, B, C, D, E, G, H, I, J, K, M, N, P, U, V, W}.

#### Bước 4: Nối tiếp kết quả R1234 với R6 (THANH_VIEN_NHOM) qua cặp {M, P}
- Giao thuộc tính:  
  `R1234 ∩ R6 = { ... } ∩ {M, P, R} = {M, P}`
- Xét cặp thuộc tính chung {M, P}:
  - Ta có phụ thuộc hàm `f8: (M, P) → R`, suy ra `{M, P} → R6`.
  - Vì (M, P) là khóa chính của R6 (THANH_VIEN_NHOM), nên `{M, P}` là siêu khóa của R6.
- **Kết luận Bước 4:** Phép nối tiếp là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R12346 = R1234 ∪ R6 = {A, B, C, D, E, G, H, I, J, K, M, N, P, R, U, V, W}.

#### Bước 5: Nối tiếp kết quả với R5 (NGUOI_DUNG)
- Bảng `NGUOI_DUNG` trong hệ thống thực tế tổng quát hóa cả hai vai trò:
  - Nối qua thuộc tính P (`ma_nguoi_thuc_hien`): Giao là `{P}`, là khóa chính của tài khoản người dùng, xác định duy nhất họ tên `S` và email `T`.
  - Nối qua thuộc tính K (`ma_giang_vien`): Giao là `{K}`, là khóa chính của tài khoản người dùng, xác định duy nhất họ tên giảng viên `L`.
- **Kết luận Bước 5:** Toàn bộ 20 thuộc tính của lược đồ ban đầu Q được phục hồi hoàn chỉnh và chính xác tuyệt đối:  
  R1 ⋈ R2 ⋈ R3 ⋈ R4 ⋈ R5 ⋈ R6 = Q.

---

## 4. Chứng minh bằng Thuật toán Tableau (Chase Algorithm)
- Lập ma trận Tableau với 20 cột (A đến W) và các hàng tương ứng với các lược đồ con.
- Lần lượt áp dụng các phụ thuộc hàm trong F:
  1. Áp dụng `f7: U → V, H`: Tại hàng R1 (có a_U), cập nhật a_V và a_H.
  2. Áp dụng `f2: H → I, J, K`: Tại hàng R1 (đã có a_H), cập nhật a_I, a_J, a_K.
  3. Áp dụng `H → M` và `M → N` (qua NHOM): Tại hàng R1, cập nhật a_M và a_N.
  4. Áp dụng `f8: (M, P) → R`: Tại hàng R1 (đã có a_M và a_P), cập nhật a_R.
  5. Áp dụng thông tin người dùng qua P và K: Tại hàng R1, cập nhật a_S, a_T và a_L.
- **Kết quả:** Hàng R1 biến đổi thành công thành dòng chứa toàn bộ các ký hiệu `a1, a2, ..., a20`.
- **Kết luận:** Phép phân rã hoàn toàn **đạt tính chất bảo toàn thông tin (Lossless Join)**.
