# Phân tích Dữ liệu Hệ thống

> **Quy chuẩn danh pháp:** Trong thiết kế cơ sở dữ liệu học thuật, tất cả tên thực thể và tên thuộc tính đều được chuẩn hóa dưới dạng **Danh từ** hoặc **Cụm danh từ** (Noun / Noun Phrase), loại bỏ hoàn toàn các cấu trúc động từ hay tính từ đơn lẻ.

---

## 1. Danh sách thực thể chính (Danh từ)
| Tên thực thể | Tên tiếng Việt | Bản chất nghiệp vụ (Cụm danh từ) |
|---|---|---|
| `NGUOI_DUNG` | Người dùng | Hồ sơ tài khoản người dùng trong hệ thống (Quản trị viên, Giảng viên, Sinh viên) |
| `DO_AN` | Đồ án | Thông tin đề tài đồ án môn học, đồ án cơ sở, đồ án chuyên ngành |
| `NHOM` | Nhóm đồ án | Tập thể nhóm sinh viên phụ trách thực hiện đồ án (quan hệ 1–1 với Đồ án) |
| `THANH_VIEN_NHOM` | Thành viên nhóm | Danh sách thành viên tham gia nhóm và chức danh phân công |
| `MOC_TIEN_DO` | Mốc tiến độ | Các mốc thời gian và giai đoạn nghiệm thu quan trọng của đồ án (Milestone) |
| `CONG_VIEC` | Công việc | Các đầu việc, nhiệm vụ cụ thể cần thực hiện kèm tiến độ và thời hạn |
| `BINH_LUAN` | Bình luận | Nội dung trao đổi, thảo luận, góp ý phản hồi cho từng công việc |
| `TEP_DINH_KEM` | Tệp đính kèm | Tài liệu, báo cáo, sản phẩm và tệp mã nguồn đính kèm |
| `THONG_BAO` | Thông báo | Bản tin thông báo hệ thống gửi đến người dùng |

---

## 2. Danh sách thuộc tính của các thực thể (100% Danh từ / Cụm danh từ)

### 2.1. Thực thể `NGUOI_DUNG` (Người dùng)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_nguoi_dung` | Mã người dùng | UUID (Khóa chính) | Mã định danh duy nhất của người dùng |
| `email` | Địa chỉ email | Chuỗi | Địa chỉ thư điện tử dùng để đăng nhập (Duy nhất) |
| `mat_khau_bam` | Mã băm mật khẩu | Chuỗi | Mật khẩu tài khoản đã được băm bảo mật |
| `ho_ten` | Họ và tên | Chuỗi | Họ và tên đầy đủ của người dùng |
| `vai_tro_he_thong` | Vai trò hệ thống | Chuỗi | Phân quyền tài khoản (`quantrivien`, `giangvien`, `sinhvien`) |
| `trang_thai_hoat_dong` | Trạng thái hoạt động | Đúng/Sai (Boolean) | Tình trạng kích hoạt (`TRUE`: Hoạt động, `FALSE`: Khóa) |
| `thoi_gian_tao` | Thời gian tạo | Ngày giờ (Timestamp) | Thời điểm khởi tạo tài khoản |

### 2.2. Thực thể `DO_AN` (Đồ án)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_do_an` | Mã đồ án | UUID (Khóa chính) | Mã định danh duy nhất của đồ án |
| `ten_do_an` | Tên đề tài đồ án | Chuỗi | Tên đầy đủ của đề tài đồ án |
| `loai_do_an` | Loại đồ án | Chuỗi | Phân loại đồ án (`mon_hoc`, `co_so`, `chuyen_nganh`) |
| `ten_mon_hoc` | Tên môn học | Chuỗi | Tên học phần/môn học tương ứng |
| `noi_dung_muc_tieu` | Nội dung mục tiêu | Văn bản | Mục tiêu và yêu cầu cần đạt của đồ án |
| `tien_do_tong` | Tiến độ tổng thể | Số thực (%) | Tỷ lệ phần trăm hoàn thành chung của toàn bộ đồ án |
| `trang_thai` | Trạng thái đồ án | Chuỗi | Tình trạng thực hiện (`dang_thuc_hien`, `hoan_thanh`, `tam_dung`) |
| `ma_giang_vien` | Mã giảng viên hướng dẫn | UUID (Khóa ngoại) | Giảng viên chịu trách nhiệm hướng dẫn đồ án |
| `thoi_gian_tao` | Thời gian tạo | Ngày giờ (Timestamp) | Thời điểm khởi tạo đồ án |

### 2.3. Thực thể `NHOM` (Nhóm đồ án)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_nhom` | Mã nhóm | UUID (Khóa chính) | Mã định danh duy nhất của nhóm sinh viên |
| `ma_do_an` | Mã đồ án | UUID (Khóa ngoại) | Đồ án mà nhóm phụ trách (Ràng buộc UNIQUE - quan hệ 1–1) |
| `ten_nhom` | Tên nhóm | Chuỗi | Tên gọi đại diện của nhóm sinh viên |

### 2.4. Thực thể `THANH_VIEN_NHOM` (Thành viên nhóm)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_thanh_vien_nhom` | Mã thành viên nhóm | UUID (Khóa chính) | Mã định danh bản ghi thành viên |
| `ma_nhom` | Mã nhóm | UUID (Khóa ngoại) | Mã nhóm sinh viên tham gia |
| `ma_nguoi_dung` | Mã người dùng | UUID (Khóa ngoại) | Tài khoản sinh viên tham gia nhóm |
| `vai_tro_trong_nhom` | Vai trò trong nhóm | Chuỗi | Chức vụ trong nhóm (`nhom_truong`, `thanh_vien`) |
| `thoi_gian_tham_gia` | Thời gian tham gia | Ngày giờ (Timestamp) | Thời điểm sinh viên gia nhập nhóm |

### 2.5. Thực thể `MOC_TIEN_DO` (Mốc tiến độ)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_moc` | Mã mốc tiến độ | UUID (Khóa chính) | Mã định danh mốc tiến độ (Milestone) |
| `ma_do_an` | Mã đồ án | UUID (Khóa ngoại) | Đồ án sở hữu mốc tiến độ này |
| `ten_moc` | Tên mốc tiến độ | Chuỗi | Tiêu đề tóm tắt cột mốc hoặc giai đoạn |
| `han_hoan_thanh` | Thời hạn hoàn thành | Ngày (Date) | Ngày chót phải hoàn thành mốc tiến độ |
| `trang_thai` | Trạng thái mốc | Chuỗi | Tình trạng mốc (`chua_hoan_thanh`, `hoan_thanh`) |
| `noi_dung_mo_ta` | Nội dung mô tả | Văn bản | Mô tả chi tiết yêu cầu của giai đoạn |

### 2.6. Thực thể `CONG_VIEC` (Công việc)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_cong_viec` | Mã công việc | UUID (Khóa chính) | Mã định danh duy nhất của công việc |
| `ma_do_an` | Mã đồ án | UUID (Khóa ngoại) | Đồ án chứa công việc |
| `ma_moc` | Mã mốc tiến độ | UUID (Khóa ngoại) | Mốc tiến độ liên kết (nếu có) |
| `tieu_de` | Tiêu đề công việc | Chuỗi | Tên tóm tắt nhiệm vụ cần thực hiện |
| `noi_dung_mo_ta` | Nội dung mô tả | Văn bản | Hướng dẫn và tiêu chí chi tiết cho công việc |
| `trang_thai` | Trạng thái công việc | Chuỗi | Tình trạng (`can_lam`, `dang_lam`, `hoan_thanh`, `tre_han`) |
| `phan_tram_tien_do` | Phần trăm tiến độ | Số thực (%) | Tỷ lệ hoàn thành công việc từ 0% đến 100% |
| `trang_thai_khoa` | Trạng thái khóa | Đúng/Sai (Boolean) | Cờ khóa bảo vệ tiến độ sau khi đã chốt duyệt |
| `han_chot` | Thời hạn hoàn thành | Ngày giờ (Timestamp) | Thời hạn cuối cùng để nộp sản phẩm công việc |
| `ma_nguoi_thuc_hien` | Mã người thực hiện | UUID (Khóa ngoại) | Thành viên được phân công làm việc |
| `ma_nguoi_tao` | Mã người giao việc | UUID (Khóa ngoại) | Người tạo ra công việc (Giảng viên hoặc Nhóm trưởng) |
| `ma_nguoi_khoa` | Mã người chốt | UUID (Khóa ngoại) | Người đã phê duyệt và khóa tiến độ |
| `ma_cong_viec_cha` | Mã công việc cha | UUID (Khóa ngoại) | Công việc cấp trên (phục vụ chia nhỏ việc con) |
| `thoi_gian_tao` | Thời gian tạo | Ngày giờ (Timestamp) | Thời điểm lập công việc |

### 2.7. Thực thể `BINH_LUAN` (Bình luận)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_binh_luan` | Mã bình luận | UUID (Khóa chính) | Mã định danh duy nhất của bình luận |
| `ma_cong_viec` | Mã công việc | UUID (Khóa ngoại) | Công việc được thảo luận |
| `ma_nguoi_dung` | Mã người gửi | UUID (Khóa ngoại) | Người gửi nội dung bình luận |
| `noi_dung` | Nội dung bình luận | Văn bản | Nội dung văn bản trao đổi |
| `thoi_gian_tao` | Thời gian gửi | Ngày giờ (Timestamp) | Thời điểm gửi bình luận |

### 2.8. Thực thể `TEP_DINH_KEM` (Tệp đính kèm)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_tep` | Mã tệp đính kèm | UUID (Khóa chính) | Mã định danh duy nhất của tệp |
| `ma_cong_viec` | Mã công việc | UUID (Khóa ngoại) | Công việc gắn tệp đính kèm |
| `ma_nguoi_dung` | Mã người tải lên | UUID (Khóa ngoại) | Người đã tải tệp lên |
| `ten_tep` | Tên tệp tin | Chuỗi | Tên gốc của tệp tài liệu |
| `duong_dan_tep` | Đường dẫn lưu trữ | Chuỗi | Đường dẫn vị trí tệp trên hệ thống lưu trữ |
| `loai_tep` | Định dạng tệp | Chuỗi | Loại MIME Type của tệp (`pdf`, `docx`, `zip`...) |
| `dung_luong` | Dung lượng tệp | Số nguyên (Bytes) | Kích thước dung lượng của tệp tính bằng Byte |
| `thoi_gian_tao` | Thời gian tải lên | Ngày giờ (Timestamp) | Thời điểm tệp được tải lên |

### 2.9. Thực thể `THONG_BAO` (Thông báo)
| Thuộc tính | Tên danh từ tiếng Việt | Kiểu dữ liệu | Diễn giải ý nghĩa |
|---|---|---|---|
| `ma_thong_bao` | Mã thông báo | UUID (Khóa chính) | Mã định danh duy nhất của thông báo |
| `ma_nguoi_dung` | Mã người nhận | UUID (Khóa ngoại) | Người dùng tiếp nhận thông báo |
| `ma_do_an` | Mã đồ án | UUID (Khóa ngoại) | Đồ án có liên quan (nếu có) |
| `ma_cong_viec` | Mã công việc | UUID (Khóa ngoại) | Công việc có liên quan (nếu có) |
| `loai_thong_bao` | Loại thông báo | Chuỗi | Phân loại thông báo (việc mới, nhắc hạn, chốt tiến độ) |
| `tieu_de` | Tiêu đề thông báo | Chuỗi | Dòng tóm tắt nội dung thông báo |
| `noi_dung` | Nội dung thông báo | Văn bản | Chi tiết thông điệp gửi tới người dùng |
| `trang_thai_doc` | Trạng thái đọc | Đúng/Sai (Boolean) | Tình trạng đã đọc (`TRUE`) hay chưa đọc (`FALSE`) |
| `thoi_gian_tao` | Thời gian gửi | Ngày giờ (Timestamp) | Thời điểm phát sinh thông báo |

---

## 3. Mối quan hệ và Bản số (Cardinality)
- **Đồ án — Nhóm đồ án:** Quan hệ 1 — 1 (Mỗi đồ án có đúng 1 nhóm thực hiện; mỗi nhóm gắn liền với 1 đồ án).
- **Đồ án — Mốc tiến độ:** Quan hệ 1 — N (Một đồ án có nhiều mốc tiến độ; mỗi mốc thuộc 1 đồ án xác định).
- **Đồ án — Công việc:** Quan hệ 1 — N (Một đồ án có nhiều công việc; mỗi công việc thuộc 1 đồ án).
- **Nhóm đồ án — Thành viên nhóm:** Quan hệ 1 — N (Một nhóm có nhiều thành viên).
- **Người dùng — Thành viên nhóm:** Quan hệ 1 — N (Một người dùng có thể tham gia vào một hoặc nhiều nhóm đồ án).
- **Người dùng — Đồ án (Giảng viên hướng dẫn):** Quan hệ 1 — N (Một giảng viên hướng dẫn nhiều đồ án).
- **Công việc — Bình luận:** Quan hệ 1 — N (Một công việc có nhiều bình luận phản hồi).
- **Công việc — Tệp đính kèm:** Quan hệ 1 — N (Một công việc có nhiều tệp đính kèm).
- **Người dùng — Thông báo:** Quan hệ 1 — N (Một người dùng nhận được nhiều thông báo).
