# Phụ thuộc hàm (Functional Dependencies)

## 1. Mô hình hóa lược đồ quan hệ ban đầu
Để phân tích chuẩn hóa cơ sở dữ liệu một cách chặt chẽ theo lý thuyết quan hệ, ta xét lược đồ quan hệ tổng quát Q (chứa tất cả các thuộc tính của công việc, đồ án, nhóm, giảng viên và người thực hiện):

Q = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, S, T, U, V, W}

### Bảng ánh xạ ký hiệu chữ cái sang thuộc tính thực tế
| Ký hiệu | Tên thuộc tính thực tế | Tên danh từ tiếng Việt | Diễn giải ngữ nghĩa |
|:---:|---|---|---|
| A | ma_cong_viec | Mã công việc | Khóa chính tự nhiên định danh từng công việc |
| B | tieu_de_cv | Tiêu đề công việc | Tên tóm tắt nhiệm vụ công việc |
| C | trang_thai_cv | Trạng thái công việc | Tình trạng (can_lam, dang_lam, hoan_thanh, tre_han) |
| D | phan_tram_tien_do | Phần trăm tiến độ | Tỷ lệ hoàn thành công việc (0% – 100%) |
| E | trang_thai_khoa | Trạng thái khóa | Cờ đánh dấu khóa tiến độ sau khi đã chốt |
| G | han_chot_cv | Thời hạn hoàn thành | Thời hạn kết thúc công việc |
| H | ma_do_an | Mã đồ án | Khóa chính xác định đồ án |
| I | ten_do_an | Tên đề tài đồ án | Tên đầy đủ của đề tài đồ án |
| J | loai_do_an | Loại đồ án | Phân loại đồ án (mon_hoc, co_so, chuyen_nganh) |
| K | ma_giang_vien | Mã giảng viên hướng dẫn | Mã định danh giảng viên phụ trách đồ án |
| L | ten_giang_vien | Tên giảng viên hướng dẫn | Họ và tên của giảng viên hướng dẫn |
| M | ma_nhom | Mã nhóm đồ án | Mã định danh nhóm sinh viên thực hiện đồ án |
| N | ten_nhom | Tên nhóm đồ án | Tên gọi đại diện của nhóm sinh viên |
| P | ma_nguoi_thuc_hien | Mã người thực hiện | Mã sinh viên được phân công làm việc |
| S | ten_nguoi_thuc_hien | Tên người thực hiện | Họ và tên sinh viên thực hiện công việc |
| T | email_nguoi_thuc_hien | Email người thực hiện | Địa chỉ thư điện tử của sinh viên thực hiện |
| U | ma_moc | Mã mốc tiến độ | Mã định danh cột mốc bàn giao (Milestone) |
| V | ten_moc | Tên mốc tiến độ | Tiêu đề của mốc tiến độ |
| W | ma_nguoi_tao | Mã người giao việc | Mã người đã tạo và giao công việc |

---

## 2. Tập phụ thuộc hàm chính F trên lược đồ tổng quát Q

Dựa trên các quy tắc ràng buộc nghiệp vụ của hệ thống quản lý đồ án, ta có tập phụ thuộc hàm:  
F = {f1, f2, f3, f4, f5, f6}

### Chi tiết từng phụ thuộc hàm và ánh xạ tương đương:

#### 1. Phụ thuộc hàm f1: A → B, C, D, E, G, H, P, U, W
- Vế trái (X = {A}): Tương đương với thuộc tính `ma_cong_viec`.
- Vế phải (Y = {B, C, D, E, G, H, P, U, W}): Tương đương với tập thuộc tính `{tieu_de_cv, trang_thai_cv, phan_tram_tien_do, trang_thai_khoa, han_chot_cv, ma_do_an, ma_nguoi_thuc_hien, ma_moc, ma_nguoi_tao}`.
- Ý nghĩa: Khi biết một Mã công việc (A), ta xác định duy nhất được tiêu đề (B), trạng thái (C), phần trăm tiến độ (D), trạng thái khóa (E), thời hạn (G), mã đồ án (H), người thực hiện (P), mã mốc (U) và người tạo việc (W).

#### 2. Phụ thuộc hàm f2: H → I, J, K, M
- Vế trái (X = {H}): Tương đương với thuộc tính `ma_do_an`.
- Vế phải (Y = {I, J, K, M}): Tương đương với tập thuộc tính `{ten_do_an, loai_do_an, ma_giang_vien, ma_nhom}`.
- Ý nghĩa: Khi biết một Mã đồ án (H), ta xác định duy nhất được tên đề tài đồ án (I), loại đồ án (J), mã giảng viên hướng dẫn (K) và mã nhóm sinh viên phụ trách (M).

#### 3. Phụ thuộc hàm f3: M → N, H
- Vế trái (X = {M}): Tương đương với thuộc tính `ma_nhom`.
- Vế phải (Y = {N, H}): Tương đương với tập thuộc tính `{ten_nhom, ma_do_an}`.
- Ý nghĩa: Mỗi Mã nhóm sinh viên (M) xác định duy nhất tên nhóm (N) và đồ án (H) mà nhóm thực hiện (ràng buộc toàn vẹn 1–1 giữa đồ án và nhóm).

#### 4. Phụ thuộc hàm f4: P → S, T
- Vế trái (X = {P}): Tương đương với thuộc tính `ma_nguoi_thuc_hien`.
- Vế phải (Y = {S, T}): Tương đương với tập thuộc tính `{ten_nguoi_thuc_hien, email_nguoi_thuc_hien}`.
- Ý nghĩa: Khi biết Mã người thực hiện (P), xác định duy nhất họ tên (S) và email (T) của sinh viên đó.

#### 5. Phụ thuộc hàm f5: K → L
- Vế trái (X = {K}): Tương đương với thuộc tính `ma_giang_vien`.
- Vế phải (Y = {L}): Tương đương với thuộc tính `ten_giang_vien`.
- Ý nghĩa: Mỗi Mã giảng viên hướng dẫn (K) xác định duy nhất họ tên của giảng viên đó (L).

#### 6. Phụ thuộc hàm f6: U → V, H
- Vế trái (X = {U}): Tương đương với thuộc tính `ma_moc`.
- Vế phải (Y = {V, H}): Tương đương với tập thuộc tính `{ten_moc, ma_do_an}`.
- Ý nghĩa: Mỗi Mã mốc tiến độ (U) xác định duy nhất tên mốc (V) và mã đồ án (H) chứa mốc đó.

---

## 3. Cơ sở thực tế và lập luận xác định các phụ thuộc hàm (Căn cứ giải trình bảo vệ đồ án)

### 3.1. Bản chất khoa học của Phụ thuộc hàm (FD)
Trong lý thuyết thiết kế cơ sở dữ liệu, một phụ thuộc hàm X → Y **không phải do thuật toán tự động sinh ra hay phỏng đoán ngẫu nhiên**, mà bắt nguồn từ chính **Quy tắc nghiệp vụ của thế giới thực (Business Rules & Constraints)** của bài toán:  
> *"Với bất kỳ hai dòng dữ liệu t1, t2 nào trong bảng, hễ t1[X] = t2[X] thì bắt buộc t1[Y] = t2[Y]. Nói cách khác: Cứ biết một giá trị cụ thể của X, thì giá trị của Y chỉ có duy nhất một kết quả tương ứng, không thể cùng một X mà lại cho ra hai giá trị Y khác nhau."*

### 3.2. Căn cứ thực tế xác định từng phụ thuộc hàm cụ thể

1. **Căn cứ xác định f1 (A → B, C, D, E, G, H, P, U, W):**
   - Trong thực tế quản lý, mỗi đầu việc khi tạo ra được cấp một mã định danh duy nhất (A - `ma_cong_viec`).
   - Một công việc cụ thể tại một thời điểm bắt buộc:
     - Chỉ có đúng 1 tiêu đề tóm tắt (B).
     - Chỉ ở đúng 1 trạng thái thực hiện (C: Cần làm / Đang làm / Hoàn thành / Trễ hạn).
     - Chỉ có 1 mức phần trăm tiến độ hoàn thành (D: 0% – 100%).
     - Chỉ có 1 trạng thái khóa tiến độ (E: Đã khóa hay Chưa khóa).
     - Chỉ có 1 thời hạn chót nộp sản phẩm (G).
     - Chỉ thuộc về đúng 1 đồ án xác định (H).
     - Chỉ phân công cho đúng 1 người chịu trách nhiệm chính (P).
     - Gắn với 1 cột mốc tiến độ xác định (U).
     - Do 1 người dùng cụ thể tạo ra và giao việc (W).
   - Không thể có trường hợp cùng một mã việc A mà lúc mang tên này, lúc mang tên khác, hay thuộc về hai đồ án khác nhau. Do đó, A xác định duy nhất toàn bộ các thuộc tính trên: `A → B, C, D, E, G, H, P, U, W`.

2. **Căn cứ xác định f2 (H → I, J, K, M):**
   - Mỗi đề tài đồ án được nhà trường và hệ thống cấp một mã số định danh duy nhất (H - `ma_do_an`).
   - Cứ biết một mã đồ án H cụ thể:
     - Luôn có 1 tên đề tài duy nhất (I).
     - Thuộc đúng 1 loại đồ án nhất định (J: Đồ án môn học, Đồ án cơ sở hoặc Đồ án chuyên ngành).
     - Do đúng 1 giảng viên hướng dẫn chính chịu trách nhiệm (K).
     - Đặc biệt, theo quy định nghiệp vụ đồ án nhóm đã chốt: **Mô hình 1 Đồ án = 1 Nhóm sinh viên thực hiện**. Nghĩa là một đề tài đồ án chỉ giao cho đúng một nhóm sinh viên đảm nhận. Do đó, biết mã đồ án H là xác định được duy nhất mã nhóm sinh viên phụ trách (M).
   - Vì vậy: `H → I, J, K, M`.

3. **Căn cứ xác định f3 (M → N, H):**
   - Mỗi nhóm sinh viên được cấp một mã nhóm duy nhất (M - `ma_nhom`).
   - Cứ biết mã nhóm M:
     - Xác định được tên đại diện của nhóm (N, ví dụ "Nhóm 01", "Nhóm Web DACS").
     - Nhóm này được thành lập chỉ để thực hiện duy nhất 1 đề tài đồ án trong kỳ học (H).
   - Vì vậy: `M → N, H`.

4. **Căn cứ xác định f4 (P → S, T):**
   - Mỗi sinh viên trong trường đại học sở hữu một mã số sinh viên / mã người dùng duy nhất (P - `ma_nguoi_thuc_hien`).
   - Cứ biết mã sinh viên P:
     - Hệ thống xác định chính xác họ và tên đầy đủ của sinh viên đó (S).
     - Xác định chính xác địa chỉ email học vụ của sinh viên (T).
   - Không thể tồn tại việc một mã sinh viên lại mang tên của hai người khác nhau hay hai địa chỉ email khác nhau. Do đó: `P → S, T`.

5. **Căn cứ xác định f5 (K → L):**
   - Mỗi giảng viên trong khoa có một mã định danh cán bộ/giảng viên duy nhất (K - `ma_giang_vien`).
   - Biết mã giảng viên K luôn luôn xác định được duy nhất họ và tên của giảng viên hướng dẫn (L).
   - Vì vậy: `K → L`.

6. **Căn cứ xác định f6 (U → V, H):**
   - Mỗi mốc tiến độ (Milestone) được cấp một mã mốc duy nhất (U - `ma_moc`).
   - Biết mã mốc U xác định được duy nhất tên gọi của cột mốc (V, ví dụ "Báo cáo đề cương tuần 3", "Nộp bản thiết kế CSDL") và mốc thời gian này được tạo ra bên trong đồ án nào (H).
   - Vì vậy: `U → V, H`.

### 3.3. Vì sao phải gom vào lược đồ Q ban đầu và tìm các phụ thuộc hàm?
Đây là cơ sở lý thuyết chuẩn hóa để trả lời giảng viên:
1. **Đặt vấn đề (Giả định lưu trữ chưa chuẩn hóa):** Nếu một người lập trình chưa học CSDL, họ sẽ có xu hướng gom tất cả thông tin vào **một bảng cơ sở dữ liệu khổng lồ duy nhất Q** (lưu chung cả công việc, đề tài đồ án, nhóm, sinh viên, giảng viên).
2. **Phát hiện bất thường và vi phạm:**
   - Trong bảng Q, khóa chính tự nhiên là A (`ma_cong_viec`).
   - Tuy nhiên, trong bảng lại tồn tại các phụ thuộc hàm f2 (H → I, J, K, M), f4 (P → S, T), f5 (K → L). Trong đó vế trái H, P, K **không phải là khóa chính của Q**.
   - Dẫn đến hiện tượng **Phụ thuộc bắc cầu**: Ta có A → H và H → I nên suy ra A → I.
   - **Hậu quả thực tế:** Khi một sinh viên tạo 50 công việc trong đồ án, hệ thống phải gõ lặp lại tên đề tài đồ án (I), tên giảng viên (L) đúng 50 lần trên 50 dòng công việc. Điều này gây lãng phí bộ nhớ lưu trữ, làm dữ liệu bị phình to và rất dễ xảy ra sai lệch thông tin khi cập nhật.
3. **Mục đích của việc xác định f1 đến f6:** Là bằng chứng toán học chứng minh bảng Q bị vi phạm dạng chuẩn 3NF, từ đó làm căn cứ để **tách (phân rã)** một cách khoa học ra thành các bảng độc lập: Bảng Công việc, Bảng Đồ án, Bảng Nhóm, Bảng Người dùng.

---

## 4. Các tập phụ thuộc hàm trên các lược đồ quan hệ độc lập

Ngoài quan hệ tổng thể Q ở trên, hệ thống có các quan hệ phụ trợ độc lập được mô hình hóa như sau:

### 4.1. Lược đồ NGUOI_DUNG (Q_ND)
- Tập thuộc tính: Q_ND = {A_ND, B_ND, C_ND, D_ND, E_ND, G_ND, H_ND}
  - A_ND: `ma_nguoi_dung`
  - B_ND: `email`
  - C_ND: `mat_khau_bam`
  - D_ND: `ho_ten`
  - E_ND: `vai_tro_he_thong`
  - G_ND: `trang_thai_hoat_dong`
  - H_ND: `thoi_gian_tao`
- Phụ thuộc hàm: f7: A_ND → B_ND, C_ND, D_ND, E_ND, G_ND, H_ND  
  (Mã người dùng A_ND xác định tất cả thông tin tài khoản của người dùng)

### 4.2. Lược đồ THANH_VIEN_NHOM (Q_TV)
- Tập thuộc tính: Q_TV = {B1, B2, B3, B4, B5}
  - B1: `ma_thanh_vien_nhom`
  - B2: `ma_nhom`
  - B3: `ma_nguoi_dung`
  - B4: `vai_tro_trong_nhom`
  - B5: `thoi_gian_tham_gia`
- Phụ thuộc hàm: f8: (B2, B3) → B4, B5 và B1 → B2, B3, B4, B5  
  (Cặp mã nhóm và mã người dùng xác định duy nhất vai trò và thời gian tham gia)

### 4.3. Lược đồ BINH_LUAN (Q_BL)
- Tập thuộc tính: Q_BL = {C1, C2, C3, C4, C5}
  - C1: `ma_binh_luan`, C2: `ma_cong_viec`, C3: `ma_nguoi_dung`, C4: `noi_dung`, C5: `thoi_gian_tao`
- Phụ thuộc hàm: f9: C1 → C2, C3, C4, C5  
  (Mã bình luận C1 xác định duy nhất công việc, người gửi, nội dung và thời gian)

### 4.4. Lược đồ TEP_DINH_KEM (Q_TK)
- Tập thuộc tính: Q_TK = {D1, D2, D3, D4, D5, D6, D7, D8}
  - D1: `ma_tep`, D2: `ma_cong_viec`, D3: `ma_nguoi_dung`, D4: `ten_tep`, D5: `duong_dan_tep`, D6: `loai_tep`, D7: `dung_luong`, D8: `thoi_gian_tao`
- Phụ thuộc hàm: f10: D1 → D2, D3, D4, D5, D6, D7, D8  
  (Mã tệp D1 xác định duy nhất công việc, người tải lên, tên tệp, đường dẫn, định dạng và dung lượng)

### 4.5. Lược đồ THONG_BAO (Q_TB)
- Tập thuộc tính: Q_TB = {E1, E2, E3, E4, E5, E6, E7, E8, E9}
  - E1: `ma_thong_bao`, E2: `ma_nguoi_dung`, E3: `ma_do_an`, E4: `ma_cong_viec`, E5: `loai_thong_bao`, E6: `tieu_de`, E7: `noi_dung`, E8: `trang_thai_doc`, E9: `thoi_gian_tao`
- Phụ thuộc hàm: f11: E1 → E2, E3, E4, E5, E6, E7, E8, E9  
  (Mã thông báo E1 xác định người nhận, liên kết đồ án, công việc, tiêu đề, nội dung và trạng thái đọc)

---

## 5. Tìm khóa ứng viên và phân tích chuẩn hóa
1. **Tính bao đóng của thuộc tính A trên tập phụ thuộc hàm F:**
   - Tính (A)+ :
     - Bước 1: Khởi tạo (A)+ = {A}.
     - Bước 2: Áp dụng f1: A → B, C, D, E, G, H, P, U, W  
       => (A)+ = {A, B, C, D, E, G, H, P, U, W}.
     - Bước 3: Áp dụng f2: H → I, J, K, M  
       => (A)+ = {A, B, C, D, E, G, H, I, J, K, M, P, U, W}.
     - Bước 4: Áp dụng f3: M → N, H  
       => (A)+ = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, U, W}.
     - Bước 5: Áp dụng f4: P → S, T  
       => (A)+ = {A, B, C, D, E, G, H, I, J, K, M, N, P, S, T, U, W}.
     - Bước 6: Áp dụng f5: K → L  
       => (A)+ = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, S, T, U, W}.
     - Bước 7: Áp dụng f6: U → V, H  
       => (A)+ = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, S, T, U, V, W} = Q.
   - **Kết luận:** Vì bao đóng (A)+ = Q nên **A (tức `ma_cong_viec`) chính là khóa chính duy nhất của lược đồ quan hệ Q**.

2. **Phân tích nguyên nhân vi phạm chuẩn 3NF:**
   - Trong lược đồ Q, khóa chính là A.
   - Xét các phụ thuộc hàm f2 (H → I, J, K, M), f4 (P → S, T), f5 (K → L):
     - Vế trái H, P, K không phải là siêu khóa của Q.
     - Vế phải I, J, K, M, S, T, L là các thuộc tính không khóa.
   - Đây chính là các **phụ thuộc hàm bắc cầu** (Transitive Dependency) vi phạm dạng chuẩn 3 (3NF).
   - Vì vậy, cần phân rã lược đồ Q thành các lược đồ con tương ứng với từng thực thể nghiệp vụ chuẩn hóa.
