# Hướng dẫn xem sơ đồ Mermaid

## 1. Vì sao bị lỗi "Start tag expected, '<' not found"?
Thông báo này là lỗi **XML**, không phải lỗi cú pháp của sơ đồ UML.

Thường xảy ra khi:
- Mở trực tiếp file `.md` bằng công cụ **Draw.io / diagrams.net** (Draw.io chỉ mở file định dạng `.drawio` hoặc file XML).
- Dán nguyên khối Markdown (gồm cả 3 dấu backtick ` ```mermaid `) vào ô nhập mã của Draw.io sai cách.
- Tiện ích mở rộng XML trong trình soạn thảo cố gắng phân tích cú pháp Markdown như tài liệu XML.

## 2. Cách xem sơ đồ trực quan và chính xác
1. **Trên GitHub:** Mở file trực tiếp trên trình duyệt, GitHub tự động biên dịch và vẽ sơ đồ Mermaid.
2. **Trên trang Mermaid Live Editor:** Truy cập https://mermaid.live, sao chép phần mã **bên trong** khối mermaid (không lấy dòng ` ```mermaid ` và ` ``` `), dán vào khung mã bên trái.
3. **Trong VS Code / Cursor:** Cài đặt tiện ích mở rộng *Markdown Preview Mermaid Support*, sau đó bấm tổ hợp phím xem trước Markdown (`Ctrl + Shift + V` hoặc `Ctrl + K, V`).

## 3. Khi đưa vào báo cáo Word đồ án
- Xuất sơ đồ ra file ảnh PNG chất lượng cao hoặc ảnh vector SVG từ https://mermaid.live rồi chèn vào Word.
- Hoặc vẽ lại bằng phần mềm chuyên dụng như StarUML, Astah, Draw.io theo đúng nội dung và cấu trúc đã mô tả trong tài liệu này.
