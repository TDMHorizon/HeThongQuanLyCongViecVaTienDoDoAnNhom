# Quá trình Chuẩn hóa Cơ sở dữ liệu (Chi tiết từ Bản tính toán)

## Bước 0: Lược đồ ban đầu chưa chuẩn hóa (UNF / Quan hệ rộng)

Xét lược đồ quan hệ tổng quát Q và tập phụ thuộc hàm F đã xác định từ bài toán thực tế:

* **Tập thuộc tính:**
  ```text
  Q = {A, B, C, D, E, G, H, I, J, K, L, M, N, P, R, S, T, U, V, W}
  ```
  *(Gồm 20 thuộc tính: A - Mã công việc, B - Tiêu đề, C - Trạng thái, D - % Tiến độ, E - Trạng thái khóa, G - Hạn chót, H - Mã đồ án, I - Tên đồ án, J - Loại đồ án, K - Mã giảng viên, L - Tên giảng viên, M - Mã nhóm, N - Tên nhóm, P - Mã người thực hiện, R - Vai trò trong nhóm, S - Tên người thực hiện, T - Email người thực hiện, U - Mã mốc tiến độ, V - Tên mốc, W - Mã người tạo).*

* **Tập phụ thuộc hàm F:**
  ```text
  F = {
    f1: A  -> B, C, D, E, G, P, U, W
    f2: H  -> I, J, K, M
    f3: M  -> N, H
    f4: P  -> S, T
    f5: T  -> P
    f6: K  -> L
    f7: U  -> V, H
    f8: MP -> R
  }
  ```

* **Khóa chính của Q:**
  * Thuộc tính nguồn: `N = A` (chỉ xuất hiện ở vế trái, không có ở vế phải).
  * Bao đóng: `(A)+ = A B C D E G P U W S T V H I J K M N L R = Q`.
  * Khóa chính: `k = A`. Tập thuộc tính không khóa: `K̄ = {B, C, D, E, G, H, I, J, K, L, M, N, P, R, S, T, U, V, W}`.

* **Vấn đề tồn tại khi chưa chuẩn hóa trên bảng Q:**
  - **Dư thừa dữ liệu (Redundancy):** Lặp lại tên đồ án (I), tên giảng viên (L), tên nhóm (N) trên mỗi dòng công việc A.
  - **Bất thường khi cập nhật (Update Anomaly):** Đổi tên đề tài đồ án phải sửa trên tất cả các dòng công việc của đồ án đó.
  - **Bất thường khi xóa (Deletion Anomaly):** Xóa hết công việc trong đồ án thì mất luôn thông tin đề tài và giảng viên hướng dẫn.

---

## 1. Dạng chuẩn 1 (1NF)

### 1.1. Cơ sở lý thuyết
Một lược đồ quan hệ đạt 1NF nếu và chỉ nếu tất cả các miền giá trị của các thuộc tính đều chỉ chứa các giá trị nguyên tử (atomic value), không chứa thuộc tính đa trị (multivalued) hoặc nhóm lặp (repeating groups).

### 1.2. Đánh giá:
- Mọi thuộc tính từ A đến W trong Q đều là các trường dữ liệu đơn lẻ (chuỗi, số, ngày giờ, đúng/sai, mã định danh), không chứa mảng hay nhóm lặp.
- **Kết luận:** Lược đồ Q **đạt dạng chuẩn 1 (1NF)**.

---

## 2. Dạng chuẩn 2 (2NF)

### 2.1. Cơ sở lý thuyết
Một lược đồ quan hệ đạt 2NF nếu:
1. Đã đạt dạng chuẩn 1 (1NF).
2. Mọi thuộc tính không khóa đều phụ thuộc hàm **đầy đủ** vào khóa chính (nghĩa là không tồn tại thuộc tính không khóa nào phụ thuộc vào một tập con thực sự của khóa chính).

### 2.2. Đánh giá:
- Khóa chính của Q là thuộc tính đơn: `k = {A}`.
- Do khóa chính chỉ có duy nhất 1 thuộc tính A, nên không tồn tại tập con thực sự của khóa chính.
- Vì vậy không có phụ thuộc hàm từng phần vào khóa chính A.
- **Kết luận:** Lược đồ Q **đạt dạng chuẩn 2 (2NF)**.

---

## 3. Dạng chuẩn 3 (3NF)

### 3.1. Cơ sở lý thuyết
Một lược đồ quan hệ đạt 3NF nếu:
1. Đã đạt dạng chuẩn 2 (2NF).
2. Không tồn tại thuộc tính không khóa nào phụ thuộc **bắc cầu** (Transitive Dependency) vào khóa chính.
*(Nói cách khác: Với mọi phụ thuộc hàm không tầm thường X → Y, thì X phải là một siêu khóa hoặc Y là một thuộc tính khóa).*

### 3.2. Đánh giá vi phạm và phân tích:
- Trong lược đồ Q, ta có các phụ thuộc hàm bắc cầu:
  - `A -> U` và `U -> V, H` dẫn đến `A -> V, H` (U không phải siêu khóa của Q).
  - `A -> U -> H` và `H -> I, J, K, M` dẫn đến `A -> I, J, K, M` (H không phải siêu khóa của Q).
  - `H -> K` và `K -> L` dẫn đến `H -> L` (K không phải siêu khóa của Q).
  - `A -> P` và `P -> S, T` dẫn đến `A -> S, T` (P không phải siêu khóa của Q).
  - `A -> MP` và `MP -> R` dẫn đến `A -> R` (MP không phải siêu khóa của Q).
- **Kết luận:** Lược đồ Q ban đầu **vi phạm 3NF nghiêm trọng**, bắt buộc phải phân rã thành các lược đồ con.

---

## 4. Dạng chuẩn Boyce-Codd (BCNF) và Quá trình Phân rã

### 4.1. Cơ sở lý thuyết
Một lược đồ quan hệ đạt chuẩn BCNF nếu mọi phụ thuộc hàm không tầm thường X → Y thì X bắt buộc phải là một siêu khóa (Superkey).

### 4.2. Rã phụ thuộc hàm thành thuộc tính đơn (F'):
```text
F' = {
  A -> B ; A -> C ; A -> D ; A -> E ; A -> G ; A -> P ; A -> U ; A -> W ;
  H -> I ; H -> J ; H -> K ; H -> M ;
  M -> N ; M -> H ;
  P -> S ; P -> T ;
  T -> P ;
  K -> L ;
  U -> V ; U -> H ;
  MP -> R
}
```

### 4.3. Kết quả phân rã thành 8 lược đồ con đạt BCNF:

| Lược đồ con | Tập thuộc tính | Khóa chính (PK) | Khóa dự tuyển (Candidate Key) | Phụ thuộc hàm bảo toàn | Dạng chuẩn | Bảng CSDL tương ứng |
|:---:|---|:---:|:---:|---|:---:|---|
| **R1** | `{A, B, C, D, E, G, P, U, W}` | A | A | `A -> B, C, D, E, G, P, U, W` | **BCNF** | `cong_viec` |
| **R2** | `{H, I, J, K, M}` | H | H, M | `H -> I, J, K, M` và `M -> H` | **BCNF** | `do_an` |
| **R3** | `{M, N, H}` | M | M, H | `M -> N, H` và `H -> M` | **BCNF** | `nhom` |
| **R4** | `{P, S, T}` | P | P, T | `P -> S, T` | **BCNF** | `nguoi_thuc_hien` |
| **R5** | `{T, P}` | T | T, P | `T -> P` và `P -> T` | **BCNF** | `email_nguoi_dung` |
| **R6** | `{K, L}` | K | K | `K -> L` | **BCNF** | `giang_vien` |
| **R7** | `{U, V, H}` | U | U | `U -> V, H` | **BCNF** | `moc_tien_do` |
| **R8** | `{M, P, R}` | `(M, P)` | `(M, P)` | `(M, P) -> R` | **BCNF** | `thanh_vien_nhom` |

---

## 5. Kết luận về tính chất của phép phân rã

1. **Bảo toàn thông tin (BTTT - Lossless Join):**
   * Theo thuật toán Chase (Tableau) với 20 cột và 8 hàng, dòng R1 ban đầu có `x` tại `{A, B, C, D, E, G, P, U, W}`, sau khi áp dụng lần lượt các phụ thuộc hàm từ R2 đến R8 thì toàn bộ các cột còn lại `{H, I, J, K, L, M, N, R, S, T, V}` đều được lấp đầy dấu `✓`.
   * Hàng R1 biến đổi thành công thành dòng đầy đủ 20 thuộc tính ⇒ **Đạt Bảo toàn thông tin**.

2. **Bảo toàn phụ thuộc hàm (BTPTH - Dependency Preservation):**
   * Mỗi phụ thuộc hàm trong tập F ban đầu đều được chiếu nguyên vẹn vào ít nhất một lược đồ con:
     `f1 ∈ R1`, `f2 ∈ R2`, `f3 ∈ R3`, `f4 ∈ R4`, `f5 ∈ R5`, `f6 ∈ R6`, `f7 ∈ R7`, `f8 ∈ R8`.
   * Hợp các phụ thuộc hàm trên các bảng con tương đương F ⇒ **Đạt Bảo toàn phụ thuộc hàm**.
