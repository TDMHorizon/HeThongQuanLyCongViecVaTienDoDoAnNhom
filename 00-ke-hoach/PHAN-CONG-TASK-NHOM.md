# BẢNG PHÂN CÔNG CÔNG VIỆC NHÓM (CẬP NHẬT THEO TRAO ĐỔI GIẢNG VIÊN)

> **Nguyên tắc làm việc song song trên GitHub:**
> 1. Mỗi người làm việc trên **nhánh riêng** từ `master` hiện tại, không sửa chéo file của nhau ngoài phạm vi đã phân công.
> 2. Tuyệt đối **giữ nguyên cấu trúc 9 bảng CSDL chuẩn BCNF** (`src/db/schema.sql`) và bảng Tableau $20 \times 8$.
> 3. Mọi cập nhật code/API/UI đều phải cập nhật tương ứng vào `CAY-LIEN-KET-HE-THONG.md`.

---

## PHẦN 1: CÔNG VIỆC CỦA `TDMHorizon` (Nhóm trưởng)
*Nhánh làm việc: `master` / `feature/ui-and-github-dashboard`*

- [x] **Task A0 — Tinh giản Giao diện Tổng quan GVPTMH & Sinh viên:**
  - Giao diện Giảng viên: Rút gọn banner, 1 hàng 4 KPI tóm tắt, 3 Tab rõ ràng (*Giám sát Nhóm*, *Ngân hàng Đề tài*, *Sĩ số Sinh viên*) ưu tiên bảng tổng quan dễ quét.
  - Giao diện Sinh viên: 1 thẻ trạng thái chính trên cùng + bộ lọc nhanh + lưới đề tài tối giản (mô tả chi tiết xem qua popup "Chi tiết").
- [x] **Task A1 — CSDL bổ trợ `lien_ket_github` & Backend GitHub Sync Proxy (`server.js`, `initDb.js`):**
  - Tạo bảng phụ `lien_ket_github` lưu cấu hình repo, member mapping JSON và cache JSON.
  - Xây dựng API `GET /api/github/dashboard`, `POST /api/github/connect`, `POST /api/github/sync`, `POST /api/github/mapping`, `DELETE /api/github/connect`.
- [x] **Task A2 — Giao diện `GitHubDashboardView.jsx`:**
  - Kết nối Repo GitHub (Public hoặc Private kèm Token tùy chọn).
  - Thống kê đóng góp của từng thành viên (số commit, tỷ lệ, lần push cuối, ánh xạ GitHub username $\leftrightarrow$ sinh viên).
  - Dòng thời gian "Đã làm được gì" (gom commit theo ngày, lọc theo thành viên/nhánh, mở commit gốc trên GitHub).
- [x] **Task A3 — Task Dài hạn (Đặt khung trước, chưa code UI):**
  - Tạo `src/constants/guideConfig.js` định nghĩa cấu trúc bước hướng dẫn sử dụng theo vai trò; chờ chốt toàn bộ dự án mới viết nội dung và gắn Popup Tour.
- [ ] **Task A4 — Review & Merge PR của `Sixduy`:** Kiểm thử tích hợp và giữ lịch sử GitHub chỉ gồm 2 Contributors (`TDMHorizon` & `Sixduy`).

---

## PHẦN 2: CÔNG VIỆC GIAO CHO `Sixduy`
*Nhánh: `feature/sixduy-excel-team-rules` (đã hoàn thiện, sẵn sàng tạo Pull Request về `TDMHorizon:master`)*  
*Lưu ý phạm vi: Không sửa lại bố cục tổng quan GV/SV trong `ClassroomPortalView.jsx` (đã do `TDMHorizon` phụ trách ở Task A0); chỉ tập trung vào Modal Tạo/Import Đề tài, Modal Lập nhóm và Backend `server.js`.*

### - [x] Task B2: Số lượng Thành viên Linh hoạt (`Min = 1`, `Max = Không giới hạn`)
* **Mục tiêu:** Bỏ giới hạn cứng "1 người" hoặc "2-3 người" hiện tại; cho phép Giảng viên tùy ý thiết lập số thành viên tối đa (hoặc để **Không giới hạn**), còn tối thiểu luôn là **1 người**.
* **Đã hoàn thành:**
  1. Trong Modal Tạo/Sửa đề tài: Thay 2 nút radio cứng `Nhóm 2-3 SV / Cá nhân 1 SV` bằng input số **`Số lượng SV tối đa`** + checkbox **`Không giới hạn thành viên`** (mặc định `Min = 1`).
  2. Trong `server.js` (`parseTopicMeta`): hỗ trợ đọc siêu dữ liệu số lượng linh hoạt (ví dụ `[SL: 1-∞]` hoặc `[SL: 1-5]` trong `noi_dung_muc_tieu` để không phá vỡ 9 bảng BCNF), đồng thời giữ tương thích với các đề tài cũ.
  3. Trong `server.js` (`POST /api/topics/:id/register-team` & `register-solo`) và Modal Lập nhóm: bỏ check cứng `memberIds.length < 2 || > 3`. Nếu chọn 1 người $\rightarrow$ tự gán `nhom_truong`; nếu chọn $\ge 2$ người $\rightarrow$ đặt tên nhóm & chọn Nhóm trưởng; nếu `max` là không giới hạn $\rightarrow$ cho phép chọn bao nhiêu bạn tùy ý.

### - [x] Task B3: Đánh dấu & Chặn Sinh viên Đã có Nhóm trong Cùng 1 Lớp
* **Mục tiêu:** Sửa triệt để lỗi hiện tại cho phép 1 sinh viên tham gia tới 2 nhóm trong cùng 1 lớp.
* **Đã hoàn thành:**
  1. **Frontend (Modal chọn thành viên lập nhóm):**
     - Kiểm tra xem sinh viên đã thuộc nhóm nào trong **cùng lớp (`ten_mon_hoc`)** chưa.
     - Nếu đã có nhóm: vẫn hiện tên để biết, nhưng **làm mờ (`opacity: 0.55`), khóa checkbox (`disabled`)** và gắn nhãn **`🔒 Đã thuộc [Tên nhóm]`**. Tuyệt đối không tự động tick sẵn họ vào nhóm mới.
  2. **Backend (`server.js`):**
     - Trong cả `POST /api/topics/:id/register-solo` và `POST /api/topics/:id/register-team`, trước khi thêm vào `thanh_vien_nhom`, truy vấn SQL kiểm tra từng `userId` trong `memberIds` xem đã thuộc nhóm khác của cùng `ten_mon_hoc` chưa.
     - Nếu trùng: trả về **`HTTP 400`** với thông báo rõ ràng *"Sinh viên [Họ tên] đã thuộc nhóm [Tên nhóm] trong lớp này!"*.

### - [x] Task B4: Import Ngân hàng Đề tài từ File Excel / CSV riêng của Giảng viên
* **Mục tiêu:** Giảng viên có file Excel đề tài riêng (có khi chỉ có đúng cột tên đề tài, không có mô tả) có thể đưa thẳng lên web để sinh viên chọn.
* **Đã hoàn thành:**
  1. Đã cài thư viện `xlsx` (`npm install xlsx`) trong `07-nguon-code/demo-giao-dien`.
  2. Thêm tab **"📊 Import từ Excel / CSV"** trong Modal Thêm đề tài:
     - Cho phép chọn/kéo thả file `.xlsx`, `.xls`, `.csv`.
     - Đọc sheet đầu tiên và hiển thị giao diện **Ánh xạ cột & Xem trước**:
       - Dropdown **Cột Tên đề tài (*Bắt buộc duy nhất*)** — tự động nhận diện gợi ý cột có chữ "tên" / "đề tài" / "topic".
       - Dropdown **Cột Mô tả / Thông tin đề tài (*Không bắt buộc*)** — có tùy chọn *"Không có / Bỏ qua"*.
       - Dropdown **Cột Số thành viên tối đa (*Không bắt buộc*)** — có tùy chọn *"Áp dụng thiết lập chung"*.
     - Hiển thị bảng preview dữ liệu chuẩn bị nhập + nút **`+ Công bố N đề tài vào Ngân hàng`** (gọi lại API `POST /api/topics` hỗ trợ mảng `topics` đã có).

### - [x] Task B5: Gắn điểm neo `data-tour-id`
* Đã gắn đầy đủ thuộc tính `data-tour-id` lên các nút Import Excel (`tab-import-excel`, `excel-dropzone`, `excel-column-mapping`), ô cấu hình số lượng thành viên (`topic-max-members-input`) và thẻ sinh viên bị khóa (`team-member-disabled`), đồng thời đăng ký vào `guideConfig.js`.
* **Hoàn thiện các yêu cầu nâng cao (Phiên bổ sung):**
  1. Loại bỏ hoàn toàn tùy chọn/checkbox "Không giới hạn (∞)" tại cả form tạo đề tài theo dòng và mapping file Excel/CSV, bắt buộc Giảng viên quy định số lượng SV tối đa cụ thể.
  2. Bổ sung nút "🗑️ Xóa" đề tài trực tiếp trên cột THAO TÁC của bảng Ngân hàng Đề tài (Tab 2 Giảng viên), tích hợp endpoint cascade `DELETE /api/topics/:id` và hộp thoại cảnh báo trước khi xóa.
  3. Đề tài cá nhân 1 sinh viên (`so_luong_toi_da === 1` hoặc `quy_mo === 'ca_nhan'`): Giao diện sinh viên chỉ hiển thị nút "⚡ Xác nhận nhận đề tài" (mở Modal C xác nhận cá nhân), tuyệt đối không mở Modal Lập nhóm D.
  4. Quét trạng thái đề tài và nhóm theo thời gian thực qua `assignedStudentMap`: Tự động làm mờ (`opacity: 0.45`, `pointerEvents: 'none'`) và khóa checkbox `disabled` tất cả sinh viên đã có nhóm trong Modal Lập nhóm D, đồng thời vô hiệu hóa trong dropdown của Modal C.
  5. Cơ chế Tự động nâng/hạ quy mô đề tài (`getTopicScaleInfo`): Không còn bị fix cứng ở con số 3 SV. Khi đề tài đã có nhóm đăng ký, huy hiệu tự động co giãn hiển thị chính xác số lượng thực tế của nhóm (`Cá nhân (1 SV)`, `Nhóm (2 SV)`, `Nhóm (3 SV)`, `Nhóm (N SV)`); khi đề tài còn trống hiển thị theo hạn mức cấu hình (`Nhóm (1-N SV)`) với bộ điều khiển tăng/giảm `[-]` `[+]` trực quan; Modal Lập nhóm D tự động phản ánh quy mô nhóm co giãn tức thì theo số thành viên đang được tick chọn.
