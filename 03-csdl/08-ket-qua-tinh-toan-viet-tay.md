# Kết quả Tính toán Chuẩn hóa Cơ sở Dữ liệu (Bản ghi chép tay)

> **Mô tả:** Tài liệu ghi lại chính xác 100% nội dung tính toán thực tế từ bản viết tay trên giấy kẻ ô của sinh viên, bao gồm: xác định khóa bằng bao đóng, đánh giá dạng chuẩn 1NF/2NF/BCNF, phân rã R1 – R8, bảng phương pháp Tableau chứng minh Bảo toàn thông tin (BTTT) và Bảo toàn phụ thuộc hàm (BTPTH).

---

## TRANG 1: TẬP PHỤ THUỘC HÀM, TÌM KHÓA VÀ PHÂN RÃ BCNF

### 1. Lược đồ quan hệ ban đầu
```text
Q = A B C D E G H I J K L M N P R S T U V W
```
*(Gồm 20 thuộc tính: A, B, C, D, E, G, H, I, J, K, L, M, N, P, R, S, T, U, V, W)*

---

### 2. Tập phụ thuộc hàm F
```text
F = A  -> B C D E G P U W
    H  -> I J K M
    M  -> N H
    P  -> S T
    T  -> P
    K  -> L
    U  -> V H
    MP -> R
```

---

### 3. Tìm khóa của lược đồ quan hệ Q
* **Tìm tập thuộc tính nguồn N (các thuộc tính không xuất hiện ở vế phải của F):**
  ```text
  N = A B C D E G H I J K L M N P R S T U V W = A
        - - - - - - - - - - - - - - - - - - -
  ```
  *(Các thuộc tính từ B đến W đều xuất hiện ở vế phải và được gạch chân loại trừ, chỉ còn lại A không xuất hiện ở vế phải bất kỳ phụ thuộc hàm nào ⇒ N = A)*

* **Tính bao đóng của tập nguồn N (tức bao đóng của A):**
  ```text
  N+ = A+ = A B C D E G P U W S T V H I J K M N L R = Q
  ```
  *(Thứ tự suy diễn nạp thuộc tính: A kéo theo B C D E G P U W; P kéo theo S T; U kéo theo V H; H kéo theo I J K M; M kéo theo N; K kéo theo L; MP kéo theo R. Bao đóng chứa đủ 20 thuộc tính = Q).*

---

### 4. Xác định khóa chính và thuộc tính không khóa
```text
K = {A}
k = A
K̄ = B C D E G H I J K L M N P R S T U V W
```
* Khóa chính: `k = A` (tức `ma_cong_viec`).
* Tập thuộc tính không khóa `K̄` (K gạch đầu): gồm 19 thuộc tính còn lại `B C D E G H I J K L M N P R S T U V W`.

---

### 5. Xét các dạng chuẩn (1NF, 2NF)
```text
Đạt 1NF
Xét 2NF
không đt 2NF
Vì A -> MP
mà F: MP -> R => Q đạt 2NF
```
*(Ghi chú bản chép tay: Xét tính chất phụ thuộc hàm và phụ thuộc bắc cầu qua trung gian MP để chuyển tiếp sang phân rã chuẩn hóa).*

---

### 6. Rã tập phụ thuộc hàm thành thuộc tính đơn (F')
```text
F' = A -> B ; A -> C ; A -> D ; A -> E ; H -> I ; H -> J ; H -> K ; M -> N ; P -> S
     A -> G ; A -> P ; A -> P ; A -> U ; H -> M ; T -> P ; M -> H ; P -> T
     A -> W ; U -> V ; U -> H
```

---

### 7. Danh sách các lược đồ con phân rã và dạng chuẩn BCNF
```text
R1 A B C D E G P U W    BCNF        R7 U V H    BCNF
R2 H I J K M           BCNF        R8 M P R    BCNF
R3 M N H               BCNF
R4 P S T               BCNF
R5 T P                 BCNF
R6 K L                 BCNF
```

* **R1:** `{A, B, C, D, E, G, P, U, W}` — Đạt **BCNF** *(Tương ứng bảng CONG_VIEC)*
* **R2:** `{H, I, J, K, M}` — Đạt **BCNF** *(Tương ứng bảng DO_AN)*
* **R3:** `{M, N, H}` — Đạt **BCNF** *(Tương ứng bảng NHOM)*
* **R4:** `{P, S, T}` — Đạt **BCNF** *(Tương ứng bảng NGUOI_THUC_HIEN)*
* **R5:** `{T, P}` — Đạt **BCNF** *(Ràng buộc email duy nhất T ↔ P)*
* **R6:** `{K, L}` — Đạt **BCNF** *(Tương ứng bảng GIANG_VIEN)*
* **R7:** `{U, V, H}` — Đạt **BCNF** *(Tương ứng bảng MOC_TIEN_DO)*
* **R8:** `{M, P, R}` — Đạt **BCNF** *(Tương ứng bảng THANH_VIEN_NHOM)*

---

## TRANG 2: CHỨNG MINH BẢO TOÀN THÔNG TIN (TABLEAU) VÀ BẢO TOÀN PHỤ THUỘC HÀM

### 1. Bảng ma trận phương pháp Tableau (Chase Algorithm)

> **Quy ước trong bảng viết tay:**
> - Ký hiệu `x`: Thuộc tính có sẵn ban đầu trong lược đồ con tương ứng (tương đương ký hiệu `a` trong lý thuyết).
> - Ký hiệu `✓` (dấu tích): Thuộc tính được suy diễn nạp thêm vào hàng R1 sau khi áp dụng lần lượt các phụ thuộc hàm của F.

| Lược đồ | A | B | C | D | E | G | H | I | J | K | L | M | N | P | R | S | T | U | V | W |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **R1** | **x** | **x** | **x** | **x** | **x** | **x** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | **x** | **✓** | **✓** | **✓** | **x** | **✓** | **x** |
| **R2** | | | | | | | **x** | **x** | **x** | **x** | | **x** | | | | | | | | |
| **R3** | | | | | | | **x** | | | | | **x** | **x** | | | | | | | |
| **R4** | | | | | | | | | | | | | | **x** | | **x** | **x** | | | |
| **R5** | | | | | | | | | | | | | | **x** | | | **x** | | | |
| **R6** | | | | | | | | | | **x** | **x** | | | | | | | | | |
| **R7** | | | | | | | **x** | | | | | | | | | | | **x** | **x** | |
| **R8** | | | | | | | | | | | | **x** | | **x** | **x** | | | | | |

---

### 2. Kết luận Bảo toàn thông tin (BTTT)
```text
=> R1 BTTT
```
* **Giải thích:** Sau khi áp dụng các phụ thuộc hàm trong tập F:
  1. Từ `U` (có sẵn ở R1), áp dụng `U -> V H` (từ R7) ⇒ nạp được `V` và `H` (đánh dấu `✓`).
  2. Từ `H` (vừa có ở R1), áp dụng `H -> I J K M` (từ R2) ⇒ nạp được `I, J, K, M` (đánh dấu `✓`).
  3. Từ `M` (vừa có ở R1), áp dụng `M -> N H` (từ R3) ⇒ nạp được `N` (đánh dấu `✓`).
  4. Từ `K` (vừa có ở R1), áp dụng `K -> L` (từ R6) ⇒ nạp được `L` (đánh dấu `✓`).
  5. Từ `P` (có sẵn ở R1), áp dụng `P -> S T` (từ R4) ⇒ nạp được `S, T` (đánh dấu `✓`).
  6. Từ cặp `M` và `P` (đều đã có ở R1), áp dụng `MP -> R` (từ R8) ⇒ nạp được `R` (đánh dấu `✓`).
* Hàng **R1** đã được lấp đầy toàn bộ 20 thuộc tính (toàn bộ là `x` hoặc `✓`), do đó phép phân rã **Bảo toàn thông tin (Lossless Join)**.

---

### 3. Kết luận Bảo toàn phụ thuộc hàm (BTPTH)
```text
BTPTH do các F1,2,3,4,5,6,7,8 suy ra F nên BTPTH
```
* **Giải thích:** Tất cả các phụ thuộc hàm ban đầu trong tập F đều được kiểm tra trực tiếp trên các lược đồ con tương ứng:
  - `f1` được bảo toàn trên `R1`
  - `f2` được bảo toàn trên `R2`
  - `f3` được bảo toàn trên `R3`
  - `f4` được bảo toàn trên `R4`
  - `f5` được bảo toàn trên `R5`
  - `f6` được bảo toàn trên `R6`
  - `f7` được bảo toàn trên `R7`
  - `f8` được bảo toàn trên `R8`
* Hợp của các phép chiếu phụ thuộc hàm trên các lược đồ con sinh ra toàn bộ tập F ban đầu ⇒ **Đạt tính chất Bảo toàn phụ thuộc hàm (Dependency Preservation)**.
