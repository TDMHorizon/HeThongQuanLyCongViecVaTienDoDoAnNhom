# Sơ đồ Lớp (Class Diagram - Mức miền nghiệp vụ)

> **Cách xem sơ đồ:** Xem trên giao diện GitHub hoặc sao chép mã dán vào trang [Mermaid Live Editor](https://mermaid.live).  
> **Quy chuẩn danh pháp:**  
> - **Thuộc tính (Attributes):** 100% sử dụng **Danh từ** hoặc **Cụm danh từ**.  
> - **Phương thức (Methods / Operations) & Nhãn quan hệ (Associations):** 100% sử dụng **Động từ hành động**.

```mermaid
classDiagram
  class NguoiDung {
    +maNguoiDung: String
    +email: String
    +matKhauBam: String
    +hoTen: String
    +vaiTroHeThong: String
    +trangThaiHoatDong: Boolean
    +thoiGianTao: DateTime
    +dangNhap()
    +dangXuat()
    +doiMatKhau()
    +capNhatHoSo()
  }

  class DoAn {
    +maDoAn: String
    +tenDoAn: String
    +loaiDoAn: String
    +tenMonHoc: String
    +noiDungMucTieu: String
    +tienDoTong: Float
    +trangThai: String
    +thoiGianTao: DateTime
    +taoDoAn()
    +capNhatThongTin()
    +tinhTienDoTong()
    +dongDoAn()
  }

  class Nhom {
    +maNhom: String
    +tenNhom: String
    +maDoAn: String
    +taoNhom()
    +themThanhVien()
    +chiDinhNhomTruong()
    +xoaThanhVien()
  }

  class ThanhVienNhom {
    +maThanhVienNhom: String
    +vaiTroTrongNhom: String
    +thoiGianThamGia: DateTime
    +thamGiaNhom()
    +doiVaiTro()
    +roiNhom()
  }

  class MocTienDo {
    +maMoc: String
    +tenMoc: String
    +hanHoanThanh: Date
    +trangThai: String
    +noiDungMoTa: String
    +taoMoc()
    +capNhatMoc()
    +xoaMoc()
  }

  class CongViec {
    +maCongViec: String
    +tieuDe: String
    +noiDungMoTa: String
    +trangThai: String
    +phanTramTienDo: Float
    +trangThaiKhoa: Boolean
    +hanChot: DateTime
    +thoiGianTao: DateTime
    +giaoViec()
    +phanChiaViec()
    +capNhatTienDo()
    +chotTienDo()
    +moKhoaTienDo()
    +danhDauTreHan()
  }

  class BinhLuan {
    +maBinhLuan: String
    +noiDung: String
    +thoiGianTao: DateTime
    +guiBinhLuan()
    +xoaBinhLuan()
  }

  class TepDinhKem {
    +maTep: String
    +tenTep: String
    +duongDanTep: String
    +loaiTep: String
    +dungLuong: Integer
    +thoiGianTao: DateTime
    +taiLen()
    +taiVe()
    +xoaTep()
  }

  class ThongBao {
    +maThongBao: String
    +loaiThongBao: String
    +tieuDe: String
    +noiDung: String
    +trangThaiDoc: Boolean
    +thoiGianTao: DateTime
    +phatThongBao()
    +danhDauDaDoc()
  }

  NguoiDung "1" --> "*" ThanhVienNhom : tham_gia
  Nhom "1" --> "*" ThanhVienNhom : gom_co
  DoAn "1" --> "1" Nhom : gan_voi
  NguoiDung "1" --> "*" DoAn : huong_dan
  DoAn "1" --> "*" MocTienDo : thiet_lap
  DoAn "1" --> "*" CongViec : bao_gom
  MocTienDo "0..1" --> "*" CongViec : phan_chia
  NguoiDung "1" --> "*" CongViec : thuc_hien
  NguoiDung "1" --> "*" CongViec : giao_viec
  NguoiDung "0..1" --> "*" CongViec : chot_tien_do
  CongViec "1" --> "*" BinhLuan : chua_thao_luan
  NguoiDung "1" --> "*" BinhLuan : gui_binh_luan
  CongViec "1" --> "*" TepDinhKem : dinh_kem
  NguoiDung "1" --> "*" TepDinhKem : tai_len
  NguoiDung "1" --> "*" ThongBao : tiep_nhan
  DoAn "0..1" --> "*" ThongBao : phat_sinh
  CongViec "0..1" --> "*" ThongBao : phat_sinh
```

## Chú thích miền giá trị thuộc tính (Danh từ)
- **`NguoiDung.vaiTroHeThong`:** `QuanTriVien` (Quản trị viên), `GiangVien` (Giảng viên hướng dẫn), `SinhVien` (Sinh viên).
- **`ThanhVienNhom.vaiTroTrongNhom`:** `NhomTruong` (Nhóm trưởng), `ThanhVien` (Thành viên nhóm).
- **`CongViec.trangThai`:** `CanLam` (Cần làm / To-do), `DangLam` (Đang thực hiện), `HoanThanh` (Đã hoàn thành), `TreHan` (Quá thời hạn hoàn thành).
- **`DoAn.loaiDoAn`:** `MonHoc` (Đồ án môn học), `CoSo` (Đồ án cơ sở ngành), `ChuyenNganh` (Đồ án chuyên ngành).
- **Mối quan hệ Đồ án — Nhóm:** Tỷ lệ 1 — 1 (Mỗi đồ án có đúng 1 nhóm sinh viên thực hiện).
