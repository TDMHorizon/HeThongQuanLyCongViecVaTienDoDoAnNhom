# Phụ thuộc hàm (Functional Dependencies)

## 1. Mô hình hóa lược đồ quan hệ ban đầu (Q)
Để phân tích chuẩn hóa cơ sở dữ liệu một cách chặt chẽ theo lý thuyết quan hệ, ta xét lược đồ quan hệ tổng quát Q (chứa tất cả các thuộc tính của công việc, đề tài đồ án, nhóm sinh viên, giảng viên hướng dẫn, người thực hiện và vai trò trong nhóm):

Q = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, R, S, T, U, V, W}

### Bảng ánh xạ ký hiệu chữ cái sang thuộc tính thực tế
| Ký hiệu | Tên thuộc tính thực tế | Tên danh từ tiếng Việt | Diễn giải ngữ nghĩa |
|:---:|---|---|---|
| A | ma_cong_viec | Mã công việc | Khóa chính tự nhiên định danh từng công việc |
| B | tieu_de_cv | Tiêu đề công việc | Tên tóm tắt nhiệm vụ công việc |
| C | trang_thai_cv | Trạng thái công việc | Tình trạng thực hiện (can_lam, dang_lam, hoan_thanh, tre_han) |
| D | phan_tram_tien_do | Phần trăm tiến độ | Tỷ lệ hoàn thành công việc (0% – 100%) |
| E | trang_thai_khoa | Trạng thái khóa | Cờ đánh dấu khóa tiến độ sau khi đã chốt |
| G | han_chot_cv | Thời hạn hoàn thành | Thời hạn kết thúc công việc |
| H | ma_do_an | Mã đồ án | Khóa chính xác định đề tài đồ án |
| I | ten_do_an | Tên đề tài đồ án | Tên đầy đủ của đề tài đồ án |
| J | loai_do_an | Loại đồ án | Phân loại đồ án (mon_hoc, co_so, chuyen_nganh) |
| K | ma_giang_vien | Mã giảng viên hướng dẫn | Mã định danh giảng viên phụ trách đồ án |
| L | ten_giang_vien | Tên giảng viên hướng dẫn | Họ và tên của giảng viên hướng dẫn |
| M | ma_nhom | Mã nhóm đồ án | Mã định danh nhóm sinh viên thực hiện đồ án |
| N | ten_nhom | Tên nhóm đồ án | Tên gọi đại diện của nhóm sinh viên |
| P | ma_nguoi_thuc_hien | Mã người thực hiện | Mã sinh viên được phân công làm việc |
| R | vai_tro_trong_nhom | Vai trò trong nhóm | Trách nhiệm trong nhóm (nhom_truong, thanh_vien) |
| S | ten_nguoi_thuc_hien | Tên người thực hiện | Họ và tên sinh viên thực hiện công việc |
| T | email_nguoi_thuc_hien | Email người thực hiện | Địa chỉ thư điện tử duy nhất của sinh viên |
| U | ma_moc | Mã mốc tiến độ | Mã định danh cột mốc bàn giao (Milestone - NOT NULL) |
| V | ten_moc | Tên mốc tiến độ | Tiêu đề của mốc tiến độ |
| W | ma_nguoi_tao | Mã người giao việc | Mã người tạo/giao việc (FK tới NGUOI_DUNG) |

---

## 2. Tập phụ thuộc hàm chính và Phủ tối thiểu (Minimal Cover)

Dựa trên các quy tắc nghiệp vụ thực tế của hệ thống quản lý đồ án và kết quả tối giản hóa, tập phụ thuộc hàm F đạt phủ tối thiểu:

F = {f1, f2, f3, f4, f5, f6, f7, f8}

### Chi tiết từng phụ thuộc hàm và ánh xạ tương đương:

#### 1. Phụ thuộc hàm f1: A → B, C, D, E, G, P, U, W
- Vế trái: {A} (`ma_cong_viec`).
- Vế phải: {B, C, D, E, G, P, U, W} (`{tieu_de_cv, trang_thai_cv, phan_tram_tien_do, trang_thai_khoa, han_chot_cv, ma_nguoi_thuc_hien, ma_moc, ma_nguoi_tao}`).
- **Lưu ý phủ tối thiểu:** Đã **bỏ H khỏi vế phải** của f1. Vì `ma_moc` (U) là bắt buộc (NOT NULL) và ta có `U → H`, nên `A → U → H` dẫn đến `A → H` là phụ thuộc suy diễn bắc cầu, không giữ trong phủ tối thiểu.
- Ý nghĩa: Mỗi mã công việc xác định duy nhất tiêu đề, trạng thái, tiến độ %, cờ khóa, thời hạn, người thực hiện, mốc tiến độ gắn liền và người tạo việc.

#### 2. Phụ thuộc hàm f2: H → I, J, K, M
- Vế trái: {H} (`ma_do_an`).
- Vế phải: {I, J, K, M} (`{ten_do_an, loai_do_an, ma_giang_vien, ma_nhom}`).
- Ý nghĩa: Mỗi đồ án xác định duy nhất tên đề tài, loại đồ án, giảng viên hướng dẫn và nhóm sinh viên thực hiện (mô hình 1–1 trong MVP).

#### 3. Phụ thuộc hàm f3: M → N, H
- Vế trái: {M} (`ma_nhom`).
- Vế phải: {N, H} (`{ten_nhom, ma_do_an}`).
- Ý nghĩa: Mỗi nhóm sinh viên xác định duy nhất tên nhóm và đồ án mà nhóm đảm nhận.

#### 4. Phụ thuộc hàm f4: P → S, T
- Vế trái: {P} (`ma_nguoi_thuc_hien`).
- Vế phải: {S, T} (`{ten_nguoi_thuc_hien, email_nguoi_thuc_hien}`).
- Ý nghĩa: Mỗi mã người thực hiện xác định duy nhất họ tên và email của sinh viên.

#### 5. Phụ thuộc hàm f5: T → P
- Vế trái: {T} (`email_nguoi_thuc_hien`).
- Vế phải: {P} (`ma_nguoi_thuc_hien`).
- Ý nghĩa: Vì email trong hệ thống là duy nhất (dùng đăng nhập), nên email xác định ngược lại duy nhất mã sinh viên. Do đó, T là khóa dự tuyển (khóa ứng viên tương đương) của người thực hiện.

#### 6. Phụ thuộc hàm f6: K → L
- Vế trái: {K} (`ma_giang_vien`).
- Vế phải: {L} (`ten_giang_vien`).
- Ý nghĩa: Mỗi mã giảng viên xác định duy nhất họ tên của giảng viên hướng dẫn.

#### 7. Phụ thuộc hàm f7: U → V, H
- Vế trái: {U} (`ma_moc`).
- Vế phải: {V, H} (`{ten_moc, ma_do_an}`).
- Ý nghĩa: Mỗi mã mốc tiến độ xác định duy nhất tên mốc và mã đồ án chứa mốc đó.

#### 8. Phụ thuộc hàm f8: (M, P) → R
- Vế trái: {M, P} (`{ma_nhom, ma_nguoi_thuc_hien}`).
- Vế phải: {R} (`vai_tro_trong_nhom`).
- Ý nghĩa: Cặp mã nhóm và mã sinh viên xác định duy nhất vai trò của sinh viên đó trong nhóm (nhóm trưởng hay thành viên).

---

## 3. Cơ sở thực tế và lập luận nghiệp vụ chuyên sâu

1. **Quan hệ tương đương 1–1 giữa Đồ án (H) và Nhóm (M):**
   - Ta có `H → M` và `M → H`, nghĩa là H và M tương đương về mặt xác định hàm.
   - Trong thiết kế chuẩn hóa, ta tách riêng `DO_AN(H, I, J, K, M)` và `NHOM(M, N)` với H là khóa chính của Đồ án, M là khóa chính của Nhóm (kèm ràng buộc `M UNIQUE` trong Đồ án). Điều này đạt chuẩn BCNF và tránh phụ thuộc bắc cầu `H → M → N`.

2. **Vai trò của W (Mã người tạo việc):**
   - Trong lược đồ Q, W không suy ra S, T hay L vì người tạo việc có thể là Giảng viên hướng dẫn (K), Nhóm trưởng hoặc Thành viên (P).
   - W chỉ đóng vai trò là khóa ngoại (FK) trỏ tới bảng dùng chung `NGUOI_DUNG(ma_nguoi_dung)`.

3. **Vị trí của R (Vai trò trong nhóm):**
   - R không thể đưa vào `CONG_VIEC` vì ta có `A → U → H → M` và `A → P`, nếu đưa R vào công việc sẽ tạo phụ thuộc bắc cầu `A → (M, P) → R`.
   - Để đạt chuẩn BCNF, R bắt buộc phải nằm ở bảng trung gian `THANH_VIEN_NHOM(M, P, R)` với khóa chính là cặp `(M, P)`.

4. **Thuộc tính C (Trạng thái) và D (Phần trăm tiến độ):**
   - C (`trang_thai_cv`) và D (`phan_tram_tien_do`) là các thuộc tính trạng thái động của công việc, được cập nhật theo tiến trình thực hiện và duyệt chốt của nhóm trưởng/GVHD.

5. **Lưu ý về giá trị NULL và phụ thuộc hàm f1 (A → G, A → P):**
   - Trong lý thuyết chuẩn hóa quan hệ, phụ thuộc hàm `A → G` (hạn chót) và `A → P` (người thực hiện) được định nghĩa trên các công việc đã được phân công và đã định ngày kết thúc.
   - Trong CSDL vật lý (SQL DDL), cột `han_chot` và `ma_nguoi_thuc_hien` được thiết kế mang giá trị `NULL` để đáp ứng nghiệp vụ thực tế: cho phép tạo việc chờ phân công (Unassigned Task) hoặc việc chưa chốt thời hạn nộp.

6. **Lưu ý về Denormalization của H (`ma_do_an`) trong bảng công việc:**
   - Về mặt lý thuyết chuẩn hóa thuần túy, bảng công việc chỉ cần khóa ngoại `ma_moc` (U) vì đã có `U → H`. Tuy nhiên, trong CSDL vật lý, ta chủ động lưu thêm cột `ma_do_an` (H) trong bảng `cong_viec` để tối ưu hóa tốc độ truy vấn theo đồ án mà không phải JOIN trung gian qua `moc_tien_do`.

7. **Thuộc tính nhật ký phụ trợ `ma_nguoi_khoa` trong CSDL vật lý:**
   - Bảng `cong_viec` trong SQL có thêm cột `ma_nguoi_khoa` để ghi vết người dùng (GVHD hoặc Nhóm trưởng) đã thực hiện chốt khóa tiến độ `trang_thai_khoa` (E). Thuộc tính này là thông tin nhật ký phụ trợ đi liền với cờ khóa E nên không tạo thêm phụ thuộc hàm mới trong Q.

---

## 4. Các lược đồ quan hệ độc lập phụ trợ trong hệ thống

Bên cạnh lược đồ chính Q, hệ thống có các lược đồ phụ trợ sau:

1. **Lược đồ NGUOI_DUNG (dùng chung):**
   - Thuộc tính: {ma_nguoi_dung, email, mat_khau_bam, ho_ten, vai_tro_he_thong, trang_thai_hoat_dong, thoi_gian_tao}
   - Phụ thuộc hàm: `ma_nguoi_dung → các thuộc tính còn lại` và `email → các thuộc tính còn lại`.

2. **Lược đồ BINH_LUAN:**
   - Thuộc tính: {ma_binh_luan, ma_cong_viec, ma_nguoi_dung, noi_dung, thoi_gian_tao}
   - Phụ thuộc hàm: `ma_binh_luan → ma_cong_viec, ma_nguoi_dung, noi_dung, thoi_gian_tao`.

3. **Lược đồ TEP_DINH_KEM:**
   - Thuộc tính: {ma_tep, ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong, thoi_gian_tao}
   - Phụ thuộc hàm: `ma_tep → ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong, thoi_gian_tao`.

4. **Lược đồ THONG_BAO:**
   - Thuộc tính: {ma_thong_bao, ma_nguoi_dung, ma_do_an, ma_cong_viec, loai_thong_bao, tieu_de, noi_dung, trang_thai_doc, thoi_gian_tao}
   - Phụ thuộc hàm: `ma_thong_bao → các thuộc tính còn lại`.

---

## 5. Khung tính bao đóng và xác định khóa của Q

### 5.1. Thuật toán tính bao đóng (X)+ trên tập phủ tối thiểu F
- **Đầu vào:** Tập thuộc tính X và tập F = {f1, f2, f3, f4, f5, f6, f7, f8}.
- **Đầu ra:** Bao đóng (X)+.

### 5.2. Các bước tính bao đóng của sinh viên:
- **Tính bao đóng (A)+:**
  - Khởi tạo: (A)+ = { A }
  - Lần duyệt 1:
    - Áp dụng f1 (A → B, C, D, E, G, P, U, W): (A)+ = { A, B, C, D, E, G, P, U, W }
  - Lần duyệt 2:
    - Áp dụng f7 (U → V, H): (A)+ = { A, B, C, D, E, G, H, P, U, V, W }
    - Áp dụng f4 (P → S, T): (A)+ = { A, B, C, D, E, G, H, P, S, T, U, V, W }
    - Áp dụng f2 (H → I, J, K, M): (A)+ = { A, B, C, D, E, G, H, I, J, K, M, P, S, T, U, V, W }
  - Lần duyệt 3:
    - Áp dụng f3 (M → N, H): (A)+ = { A, B, C, D, E, G, H, I, J, K, L, M, N, P, S, T, U, V, W } (kết hợp f6: K → L)
    - Áp dụng f8 ((M, P) → R): (A)+ = { A, B, C, D, E, G, H, I, J, K, L, M, N, P, R, S, T, U, V, W } = Q.
  - Kết quả: (A)+ = Q.

### 5.3. Kết luận khóa của Q:
- Vì (A)+ = Q và không có tập con thực sự nào của {A} sinh ra Q, nên **A (`ma_cong_viec`) là khóa chính duy nhất của lược đồ tổng quát Q**.
