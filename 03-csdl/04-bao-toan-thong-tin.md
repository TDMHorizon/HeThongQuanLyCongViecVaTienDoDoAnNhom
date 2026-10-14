# Kiểm tra Bảo toàn Thông tin (Lossless Join)

## 1. Mục tiêu chứng minh
Sau khi phân rã lược đồ quan hệ tổng quát Q thành các lược đồ con R1, R2, R3, R4, phép nối tự nhiên (Natural Join) của các lược đồ này phải **không làm mất mát thông tin và không sinh ra các bộ thừa giả mạo (spurious tuples)**:

R1 ⋈ R2 ⋈ R3 ⋈ R4 = Q

---

## 2. Ký hiệu các quan hệ phân rã
Dựa trên bảng ký hiệu thuộc tính từ [02-phu-thuoc-ham.md](file:///d:/QTCuaTruc/DuAn/File%20MauDoDan/892818388Bieu%20mau%20Do%20an%20Co%20so/Bieu%20mau%20Do%20an%20Co%20so/He-thong-quan-ly-cong-viec-va-tien-do-do-an-nhom/03-csdl/02-phu-thuoc-ham.md), xét phép phân rã gồm 4 lược đồ con từ Q:

- R1 = {A, B, C, D, E, G, H, P, U, W} (Tương đương bảng `CONG_VIEC`)
- R2 = {H, I, J, K} (Tương đương bảng `DO_AN`)
- R3 = {P, S, T} (Tương đương bảng `NGUOI_DUNG` đại diện cho người thực hiện)
- R4 = {U, V, H} (Tương đương bảng `MOC_TIEN_DO`)

---

## 3. Chứng minh bằng Định lý Phân rã Nhị phân lặp
**Định lý:** Phép phân rã một lược đồ quan hệ R thành hai lược đồ RA và RB là bảo toàn thông tin đối với tập phụ thuộc hàm F khi và chỉ khi:  
`(RA ∩ RB → RA) thuộc F+`  hoặc  `(RA ∩ RB → RB) thuộc F+`  
*(Nghĩa là giao của hai tập thuộc tính phải là một siêu khóa của ít nhất một trong hai lược đồ con).*

### Áp dụng chứng minh từng bước:

#### Bước 1: Xét cặp lược đồ con (R1, R2)
- Giao hai tập thuộc tính:
  `R1 ∩ R2 = {A, B, C, D, E, G, H, P, U, W} ∩ {H, I, J, K} = {H}`
- Xét thuộc tính chung H (`ma_do_an`):
  - Từ phụ thuộc hàm f2: H → I, J, K, ta suy ra:
    `H → H, I, J, K`  =>  `H → R2`
  - Vì H là khóa chính của R2, nên `R1 ∩ R2` là một siêu khóa của R2.
- **Kết luận Bước 1:** Phép phân rã (R1, R2) là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R12 = R1 ∪ R2 = {A, B, C, D, E, G, H, I, J, K, P, U, W}.

#### Bước 2: Nối tiếp kết quả R12 với R3
- Giao hai tập thuộc tính:
  `R12 ∩ R3 = {A, B, C, D, E, G, H, I, J, K, P, U, W} ∩ {P, S, T} = {P}`
- Xét thuộc tính chung P (`ma_nguoi_thuc_hien`):
  - Từ phụ thuộc hàm f4: P → S, T, ta suy ra:
    `P → P, S, T`  =>  `P → R3`
  - Vì P là khóa chính của R3, nên `R12 ∩ R3` là một siêu khóa của R3.
- **Kết luận Bước 2:** Bước phân rã nối tiếp là **bảo toàn thông tin (Lossless Join)**.  
  Đặt R123 = R12 ∪ R3.

#### Bước 3: Nối tiếp kết quả R123 với R4
- Giao hai tập thuộc tính:
  `R123 ∩ R4 = (R1 ∪ R2 ∪ R3) ∩ {U, V, H} = {U, H}`
- Xét tập thuộc tính chung {U, H}:
  - Từ phụ thuộc hàm f6: U → V, H, ta suy ra:
    `U → U, V, H`  =>  `U → R4`  =>  `{U, H} → R4`
  - Vì U (`ma_moc`) là khóa chính của R4, nên giao thuộc tính là siêu khóa của R4.
- **Kết luận Bước 3:** Bước phân rã này hoàn toàn **bảo toàn thông tin (Lossless Join)**.

---

## 4. Chứng minh bằng Bảng Phương pháp Tableau
Xây dựng ma trận Tableau với 19 cột tương ứng với các thuộc tính từ A đến W và 4 hàng tương ứng với 4 lược đồ con:

| Lược đồ | A | B | C | D | E | G | H | I | J | K | L | M | N | P | S | T | U | V | W |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| R1 | a1 | a2 | a3 | a4 | a5 | a6 | a7 | b1_8 | b1_9 | b1_10 | b1_11 | b1_12 | b1_13 | a14 | b1_15 | b1_16 | a17 | b1_18 | a19 |
| R2 | b2_1 | b2_2 | b2_3 | b2_4 | b2_5 | b2_6 | a7 | a8 | a9 | a10 | b2_11 | b2_12 | b2_13 | b2_14 | b2_15 | b2_16 | b2_17 | b2_18 | b2_19 |
| R3 | b3_1 | b3_2 | b3_3 | b3_4 | b3_5 | b3_6 | b3_7 | b3_8 | b3_9 | b3_10 | b3_11 | b3_12 | b3_13 | a14 | a15 | a16 | b3_17 | b3_18 | b3_19 |
| R4 | b4_1 | b4_2 | b4_3 | b4_4 | b4_5 | b4_6 | a7 | b4_8 | b4_9 | b4_10 | b4_11 | b4_12 | b4_13 | b4_14 | b4_15 | b4_16 | a17 | a18 | b4_19 |

- Áp dụng f2: H → I, J, K: Cột H có chung ký hiệu a7, do đó tại hàng R1, các giá trị b1_8, b1_9, b1_10 được thay thế bằng a8, a9, a10.
- Áp dụng f4: P → S, T: Cột P có chung ký hiệu a14, do đó tại hàng R1, các giá trị b1_15, b1_16 được thay thế bằng a15, a16.
- Áp dụng f6: U → V, H: Cột U có chung ký hiệu a17, do đó tại hàng R1, giá trị b1_18 được thay thế bằng a18.
- **Kết quả:** Sau khi áp dụng các phụ thuộc hàm, hàng đầu tiên (R1) chứa toàn bộ các ký hiệu a1, a2, ..., a19.
- Theo thuật toán Chase (Tableau Algorithm), phép phân rã này **chắc chắn bảo toàn thông tin**.

---

## 5. Kết luận
Lược đồ cơ sở dữ liệu sau khi chuẩn hóa hoàn toàn **đạt tính chất bảo toàn thông tin (Lossless Join)** cả về mặt giải tích nhị phân lẫn thuật toán Tableau, bảo đảm tính toàn vẹn dữ liệu tuyệt đối khi thực hiện các câu lệnh nối bảng (JOIN).
