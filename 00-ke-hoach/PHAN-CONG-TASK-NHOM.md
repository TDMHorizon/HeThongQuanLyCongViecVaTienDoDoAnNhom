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
- [x] **Task A4 — Review & Merge PR của `Sixduy`:** Đã kiểm thử tích hợp PR #3 (`44131fe`), giữ lịch sử GitHub gồm đúng 2 Contributors (`TDMHorizon` & `Sixduy`) và chuẩn hóa lại các điểm lệch yêu cầu bên dưới.

---

## NHẬT KÝ REVIEW & KHẮC PHỤC PR #3 (`Sixduy` — Commit `44131fe`)

- **Các phần `Sixduy` hoàn thành tốt:**
  1. Tách nhánh riêng đúng quy định (`Sixduy:feature/sixduy-excel-team-rules`), không tự ý push lên `master`.
  2. **Task B3:** Khóa & làm mờ SV đã có nhóm (`assignedStudentMap`) trên UI và chặn trùng theo `ten_mon_hoc` trả `HTTP 400` ở `server.js`.
  3. **Task B4:** Cài `xlsx` (`^0.18.5`), tạo tab Import Excel/CSV + đọc sheet đầu + kèm file test mẫu `danh-sach-de-tai-mau.xlsx` / `.csv`.
  4. **Task B5 & Làm thêm:** Gắn đầy đủ `data-tour-id` vào `guideConfig.js`, thêm API `DELETE /api/topics/:id` xóa cascade sạch sẽ, và tự gán SV đang đăng nhập ở Modal nhận đề tài 1 SV.

- **Các vấn đề phát hiện ở PR #3 & Cách đã chuẩn hóa lại trên `master`:**
  1. **Tự ý bỏ tùy chọn "Không giới hạn (`∞`)" (lệch Task B2):** Dù `server.js` đã hỗ trợ `[SL: 1-∞]`, giao diện của `Sixduy` lại bỏ checkbox *Không giới hạn* và ép `max="50"` (đồng thời `handleToggleMember` fallback `|| 3` gây khóa nhầm ở 3 SV). $\Rightarrow$ **Đã khôi phục** checkbox `Không giới hạn SV (∞)` ở cả nhập từng dòng lẫn Import Excel, sửa `getTopicScaleInfo` & `handleToggleMember` cho phép chọn tự do từ `1` đến `∞` SV.
  2. **Thiếu cột ánh xạ "Số lượng SV" khi Import Excel (lệch Task B4):** Bản PR #3 chỉ mới cho map `Tên đề tài` + `Mô tả`, áp cứng 1 con số chung cho toàn bộ file. $\Rightarrow$ **Đã bổ sung** dropdown *Cột Số lượng SV tối đa (Không bắt buộc)* hỗ trợ đọc cột Quy mô có sẵn từ file Excel hoặc dùng thiết lập chung.
  3. **Xung đột với Giao diện Giảng viên tối giản mới (`ClassroomPortalView.jsx`):** PR #3 viết trên giao diện 3 tab cũ của GV và đặt nút Xóa ngay ngoài bảng. $\Rightarrow$ **Đã tích hợp sạch** giữ nguyên Sidebar tinh giản + 1 Bảng Tổng hợp Lớp duy nhất, chuyển nút **`🗑️ Xóa đề tài`** gọn vào trong **Modal Chi tiết (`MODAL E`)**.
  4. **Sai lệch nhỏ trong `server.js` (`register-team`):** Khi `leaderId` không truyền lên, câu lệnh tạo công việc mẫu dùng `leaderId` thay vì `effectiveLeaderId`. $\Rightarrow$ **Đã sửa** sang `effectiveLeaderId`.

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
* **Các điểm bổ sung từ PR #3 & Hoàn thiện sau Review (A4):**
  1. Giữ nguyên tùy chọn **`Không giới hạn SV (∞)`** song song với nhập số lượng tối đa (`Min = 1`, `Max = Không giới hạn` hoặc số tùy ý) ở cả tạo từng dòng và Import Excel/CSV.
  2. Bổ sung API `DELETE /api/topics/:id` xóa cascade sạch sẽ (giữ khóa bảo vệ `da-dacs-01`) và đặt nút **`🗑️ Xóa đề tài`** gọn gàng trong **Modal Chi tiết (`MODAL E`)** của Giảng viên.
  3. Đề tài 1 sinh viên (`!is_unlimited && (so_luong_toi_da === 1 || quy_mo === 'ca_nhan')`): Giao diện sinh viên mở thẳng Modal Xác nhận cá nhân (`Modal C`), tự gán tài khoản sinh viên đang thao tác.
  4. Quét trạng thái đã có nhóm theo thời gian thực qua `assignedStudentMap`: Tự động làm mờ và khóa checkbox `disabled` tất cả sinh viên đã có nhóm trong lớp.
  5. Bổ sung ánh xạ **`Cột Số lượng SV`** (tùy chọn) trong tab Import Excel/CSV và cơ chế hiển thị quy mô co giãn `getTopicScaleInfo` theo số lượng thực tế hoặc hạn mức `[1-∞]`.
