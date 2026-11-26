import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

// Helper tính toán quy mô đề tài tự động nâng/hạ linh hoạt theo số lượng thành viên thực tế hoặc hạn mức tối đa
export function getTopicScaleInfo(topic) {
  if (!topic) return { label: 'Đề tài', isSolo: false, count: 1, color: '#6d28d9', bg: '#f3e8ff' };

  // 1. Nếu đề tài ĐÃ CÓ NHÓM ĐĂNG KÝ: Tự động nâng/hạ quy mô theo số lượng thành viên thực tế của nhóm
  if (topic.da_dang_ky && topic.team) {
    const members = Array.isArray(topic.team.members) ? topic.team.members : [];
    const count = members.length || 1;
    if (count === 1) {
      return {
        label: 'Cá nhân (1 SV)',
        isSolo: true,
        count: 1,
        color: '#0369a1',
        bg: '#e0f2fe'
      };
    }
    return {
      label: `Nhóm (${count} SV)`,
      isSolo: false,
      count,
      color: '#6d28d9',
      bg: '#f3e8ff'
    };
  }

  // 2. Nếu đề tài CHƯA CÓ NHÓM (Còn trống): Hiển thị hạn mức linh hoạt theo cấu hình Giảng viên đã đặt
  const max = Number(topic.so_luong_toi_da) || 3;
  if (max === 1 || topic.quy_mo === 'ca_nhan') {
    return {
      label: 'Cá nhân (1 SV)',
      isSolo: true,
      count: 1,
      color: '#0369a1',
      bg: '#e0f2fe'
    };
  }

  return {
    label: `Nhóm (1-${max} SV)`,
    isSolo: false,
    count: max,
    color: '#6d28d9',
    bg: '#f3e8ff'
  };
}

export default function ClassroomPortalView() {
  const {
    classes,
    activeClassId,
    setActiveClassId,
    createClass,
    topics,
    users,
    currentUser,
    currentUserId,
    setCurrentUserId,
    isLecturer,
    studentProject,
    chibiMode,
    enterWorkspace,
    createTopic,
    deleteTopic,
    registerSoloTopic,
    registerTeamTopic,
    resetTopicRegistration
  } = useProject();

  // Bộ lọc & tìm kiếm cho Bảng Tổng hợp Lớp duy nhất của GVPTMH
  const [lecturerFilter, setLecturerFilter] = useState('all'); // 'all' | 'active' | 'open' | 'unassigned_sv'
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [studentTopicFilter, setStudentTopicFilter] = useState('all'); // 'all' | 'open' | 'taken'

  // Modals
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [teamModalTopic, setTeamModalTopic] = useState(null);
  const [soloConfirmTopic, setSoloConfirmTopic] = useState(null);
  const [detailTopicModal, setDetailTopicModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo lớp mới
  const [classForm, setClassForm] = useState({
    ma_lop: '',
    ten_lop: '',
    ten_mon_hoc: 'Công nghệ phần mềm',
    hoc_ky: 'Học kỳ 1 • 2026',
    mo_ta: ''
  });

  // Chế độ nhập đề tài: 'rows' (Nhiều dòng linh hoạt) | 'bulk' (Dán danh sách nhanh) | 'excel' (Import từ Excel/CSV)
  const [topicInputMode, setTopicInputMode] = useState('rows');

  // Danh sách các dòng đề tài nhập cùng lúc (cho phép thêm nhiều đề tài cho 1 lớp)
  const [topicRows, setTopicRows] = useState([
    { id: 1, ten_do_an: '', so_luong_toi_da: 3, noi_dung_muc_tieu: '' },
    { id: 2, ten_do_an: '', so_luong_toi_da: 1, noi_dung_muc_tieu: '' }
  ]);

  // Task B4: State quản lý file Excel / CSV tải lên và ánh xạ cột
  const [excelFile, setExcelFile] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelRows, setExcelRows] = useState([]);
  const [excelMapping, setExcelMapping] = useState({
    topicCol: '',
    descCol: '__NONE__',
    maxMembers: 3
  });
  const [excelError, setExcelError] = useState('');

  // Văn bản dán nhanh hàng loạt
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultScale, setBulkDefaultScale] = useState('nhom'); // 'nhom' | 'ca_nhan' | 'alternate'

  // Form cũ tương thích
  const [newTopicForm, setNewTopicForm] = useState({
    ten_do_an: '',
    quy_mo: 'nhom',
    ten_mon_hoc: 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    noi_dung_muc_tieu: ''
  });

  // Form lập nhóm & chọn nhóm trưởng
  const [teamForm, setTeamForm] = useState({
    ten_nhom: '',
    leaderId: '',
    memberIds: []
  });

  // Modal nhận đề tài cá nhân
  const [soloStudentId, setSoloStudentId] = useState('');

  // Danh sách sinh viên
  const students = useMemo(() => {
    return users.filter(u => u.vai_tro_he_thong === 'sinhvien');
  }, [users]);

  // Task B3 & UI Lock: Map xác định toàn diện các sinh viên đã có nhóm hoặc đã nhận đề tài
  const assignedStudentMap = useMemo(() => {
    const map = {};
    // 1. Quét từ topics (nguồn trạng thái tức thời của các nhóm đã đăng ký đề tài)
    topics.forEach(t => {
      if (t.da_dang_ky && t.team) {
        const teamName = t.team.ten_nhom || 'Đã có nhóm';
        const members = Array.isArray(t.team.members) ? t.team.members : [];
        members.forEach(m => {
          const mId = m.ma_nguoi_dung || m.ma_sinh_vien || m.id;
          if (mId) {
            map[mId] = {
              ten_nhom: teamName,
              ten_do_an: t.ten_do_an || '',
              vai_tro: m.vai_tro || 'Thành viên'
            };
          }
        });
      }
    });

    // 2. Quét bổ sung từ users.danh_sach_nhom (từ backend)
    users.forEach(u => {
      if (Array.isArray(u.danh_sach_nhom) && u.danh_sach_nhom.length > 0) {
        if (!map[u.ma_nguoi_dung]) {
          map[u.ma_nguoi_dung] = {
            ten_nhom: u.danh_sach_nhom[0].ten_nhom || 'Đã có nhóm',
            ten_do_an: u.danh_sach_nhom[0].ten_do_an || '',
            vai_tro: u.danh_sach_nhom[0].vai_tro || 'Thành viên'
          };
        }
      }
    });

    return map;
  }, [topics, users]);

  // Các nhóm đã hình thành trong lớp
  const registeredGroups = useMemo(() => {
    return topics.filter(t => t.da_dang_ky);
  }, [topics]);

  // Đề tài còn trống chờ đăng ký
  const openTopics = useMemo(() => {
    return topics.filter(t => !t.da_dang_ky);
  }, [topics]);

  // Sinh viên chưa có nhóm & tiến độ trung bình lớp (phục vụ thanh tổng hợp GVPTMH)
  const unassignedStudents = useMemo(() => {
    return students.filter(s => !s.da_co_nhom);
  }, [students]);

  const averageClassProgress = useMemo(() => {
    if (registeredGroups.length === 0) return 0;
    const sum = registeredGroups.reduce((acc, g) => acc + Number(g.tien_do_tong || 0), 0);
    return Math.round(sum / registeredGroups.length);
  }, [registeredGroups]);

  const filteredLecturerTopics = useMemo(() => {
    const keyword = lecturerSearch.trim().toLowerCase();
    return topics.filter(t => {
      if (lecturerFilter === 'active' && !t.da_dang_ky) return false;
      if (lecturerFilter === 'open' && t.da_dang_ky) return false;
      if (!keyword) return true;
      const inTitle = (t.ten_do_an || '').toLowerCase().includes(keyword);
      const inTeam = (t.team?.ten_nhom || '').toLowerCase().includes(keyword);
      const inMembers = (t.team?.members || []).some(m => (m.ho_ten || '').toLowerCase().includes(keyword));
      return inTitle || inTeam || inMembers;
    });
  }, [topics, lecturerFilter, lecturerSearch]);

  const filteredUnassignedStudents = useMemo(() => {
    const keyword = lecturerSearch.trim().toLowerCase();
    if (!keyword) return unassignedStudents;
    return unassignedStudents.filter(s =>
      (s.ho_ten || '').toLowerCase().includes(keyword) ||
      (s.email || '').toLowerCase().includes(keyword)
    );
  }, [unassignedStudents, lecturerSearch]);

  // Thông tin lớp hiện tại
  const currentClassInfo = useMemo(() => {
    return classes.find(c => c.ma_lop === activeClassId) || {
      ma_lop: '21DTHC5',
      ten_lop: 'Lớp 21DTHC5 - CNPM',
      ten_mon_hoc: 'Công nghệ phần mềm',
      hoc_ky: 'Học kỳ 1 • 2026',
      mo_ta: 'Lớp học phần chính thức môn Công nghệ phần mềm'
    };
  }, [classes, activeClassId]);

  // Sinh viên hiện tại đã có nhóm hay chưa
  const hasEnrolledProject = Boolean(studentProject);

  // Sinh viên thực hiện khi nhận đề tài cá nhân (tự động nhận diện tài khoản đang thao tác, không cần chọn thủ công)
  const currentAssignedStudent = useMemo(() => {
    if (!isLecturer && currentUser) return currentUser;
    return students.find(s => s.ma_nguoi_dung === soloStudentId) || students.find(s => !assignedStudentMap[s.ma_nguoi_dung]) || students[0] || null;
  }, [currentUser, isLecturer, students, soloStudentId, assignedStudentMap]);

  // Thao tác Xóa đề tài khỏi Ngân hàng đề tài (GVPTMH)
  const handleDeleteTopic = async (topic) => {
    if (!topic || !topic.ma_do_an) return;
    const isRegistered = topic.da_dang_ky;
    const confirmMsg = isRegistered
      ? `Đề tài "${topic.ten_do_an}" ĐÃ CÓ NHÓM ĐĂNG KÝ (${topic.team?.ten_nhom || 'Nhóm SV'}). Xóa đề tài này sẽ hủy liên kết nhóm và toàn bộ công việc liên quan. Bạn có chắc chắn muốn xóa?`
      : `Bạn có chắc chắn muốn xóa đề tài "${topic.ten_do_an}" khỏi Ngân hàng Đề tài?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      await deleteTopic(topic.ma_do_an);
      alert(`Đã xóa thành công đề tài "${topic.ten_do_an}"!`);
    } catch (err) {
      alert(`Lỗi khi xóa đề tài: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Thao tác Tạo Lớp mới (GVPTMH)
  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.ma_lop.trim()) return;
    try {
      setSubmitting(true);
      await createClass(classForm);
      setClassForm({
        ma_lop: '',
        ten_lop: '',
        ten_mon_hoc: 'Công nghệ phần mềm',
        hoc_ky: 'Học kỳ 1 • 2026',
        mo_ta: ''
      });
      setIsCreateClassModalOpen(false);
      alert('Tạo Lớp môn học mới thành công!');
    } catch (err) {
      alert(`Lỗi tạo lớp: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Thêm dòng đề tài mới vào danh sách
  const handleAddTopicRow = () => {
    setTopicRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ten_do_an: '',
        so_luong_toi_da: prev.length % 2 === 0 ? 3 : 1,
        noi_dung_muc_tieu: ''
      }
    ]);
  };

  // Xóa một dòng đề tài
  const handleRemoveTopicRow = (id) => {
    if (topicRows.length <= 1) return;
    setTopicRows(prev => prev.filter(r => r.id !== id));
  };

  // Cập nhật giá trị trường dữ liệu của 1 dòng
  const handleUpdateTopicRow = (id, field, value) => {
    setTopicRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Nạp 4 đề tài mẫu phong phú chuẩn CNPM cho lớp (hỗ trợ số lượng thành viên linh hoạt)
  const handleLoadSampleTopics = () => {
    setTopicRows([
      {
        id: Date.now() + 1,
        ten_do_an: 'Xây dựng cổng tra cứu thông tin học vụ và lịch thi tích hợp AI Chatbot',
        so_luong_toi_da: 3,
        noi_dung_muc_tieu: 'Hệ thống web SPA hỗ trợ sinh viên tra cứu điểm thi, học phí và hỏi đáp quy chế học vụ qua AI.'
      },
      {
        id: Date.now() + 2,
        ten_do_an: 'Hệ thống quản lý điểm rèn luyện và hoạt động phong trào sinh viên',
        so_luong_toi_da: 5,
        noi_dung_muc_tieu: 'Nền tảng trực tuyến chấm điểm rèn luyện minh bạch, duyệt minh chứng tham gia phong trào Khoa CNTT.'
      },
      {
        id: Date.now() + 3,
        ten_do_an: 'Ứng dụng nhắc nhở thời khóa biểu và lộ trình chứng chỉ tốt nghiệp',
        so_luong_toi_da: 1,
        noi_dung_muc_tieu: 'Module theo dõi tiến độ tích lũy chứng chỉ ngoại ngữ, tin học và cảnh báo học vụ cá nhân theo tuần.'
      },
      {
        id: Date.now() + 4,
        ten_do_an: 'Nền tảng chia sẻ tài liệu ôn tập và ngân hàng câu hỏi trắc nghiệm mã nguồn mở',
        so_luong_toi_da: 4,
        noi_dung_muc_tieu: 'Ứng dụng lưu trữ, tìm kiếm và phân quyền tải tài liệu học tập theo từng học phần.'
      }
    ]);
    setTopicInputMode('rows');
  };

  // Task B4: Đọc file Excel / CSV bằng thư viện xlsx
  const handleExcelFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setExcelError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error('File không có trang tính (Sheet) nào!');
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rawData || rawData.length === 0) throw new Error('File Excel không có dữ liệu!');

        // Lấy hàng tiêu đề (bỏ qua hàng trống đầu tiên nếu có)
        let headerRowIdx = 0;
        while (headerRowIdx < rawData.length && (!rawData[headerRowIdx] || rawData[headerRowIdx].length === 0)) {
          headerRowIdx++;
        }
        if (headerRowIdx >= rawData.length) throw new Error('Không tìm thấy dòng tiêu đề trong file!');

        const headers = (rawData[headerRowIdx] || []).map(h => String(h || '').trim()).filter(Boolean);
        if (headers.length === 0) throw new Error('Không trích xuất được tiêu đề cột!');

        // Lấy các dòng dữ liệu sau dòng tiêu đề
        const rows = rawData.slice(headerRowIdx + 1).filter(r => r && r.some(c => c !== undefined && c !== null && String(c).trim() !== ''));
        if (rows.length === 0) throw new Error('File có tiêu đề nhưng không có dòng đề tài nào bên dưới!');

        setExcelHeaders(headers);
        setExcelRows(rows);

        // Tự động nhận diện gợi ý cột Tên đề tài:
        const topicCol = headers.find(h => /tên|đề tài|topic|tiêu đề|project|name/i.test(h)) || headers[0];
        // Tự động nhận diện gợi ý cột Mô tả:
        const descCol = headers.find(h => /mô tả|nội dung|desc|yêu cầu|ghi chú|detail/i.test(h)) || '__NONE__';

        setExcelMapping({
          topicCol,
          descCol,
          maxMembers: 3
        });
      } catch (err) {
        setExcelError(err.message || 'Lỗi khi đọc file Excel/CSV!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Chuyển văn bản dán hàng loạt thành các dòng đề tài
  const handleParseBulkText = () => {
    if (!bulkText.trim()) {
      alert('Vui lòng dán danh sách đề tài vào ô văn bản trước!');
      return;
    }
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Không tìm thấy dòng đề tài nào hợp lệ!');
      return;
    }

    const newRows = lines.map((line, idx) => {
      let isSolo = bulkDefaultScale === 'ca_nhan';
      if (bulkDefaultScale === 'alternate') {
        isSolo = idx % 2 !== 0;
      }
      return {
        id: Date.now() + idx,
        ten_do_an: line,
        so_luong_toi_da: isSolo ? 1 : 3,
        noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}", chuẩn hóa CSDL BCNF và báo cáo nghiệm thu.`
      };
    });

    setTopicRows(newRows);
    setTopicInputMode('rows');
  };

  // Thao tác Tạo & Công bố Đề tài mới (GVPTMH - Hỗ trợ cả Rows, Bulk Paste và Import Excel/CSV)
  const handleCreateTopicSubmit = async (e) => {
    e.preventDefault();

    let formattedTopics = [];

    if (topicInputMode === 'excel') {
      if (!excelFile || excelRows.length === 0) {
        alert('Vui lòng chọn file Excel/CSV hợp lệ!');
        return;
      }
      const topicColIdx = excelHeaders.indexOf(excelMapping.topicCol);
      if (topicColIdx < 0) {
        alert('Vui lòng chỉ định cột Tên đề tài!');
        return;
      }
      const descColIdx = excelMapping.descCol === '__NONE__' ? -1 : excelHeaders.indexOf(excelMapping.descCol);

      formattedTopics = excelRows.map((row) => {
        const title = String(row[topicColIdx] || '').trim();
        const desc = descColIdx >= 0 ? String(row[descColIdx] || '').trim() : '';
        const max = Math.max(1, Number(excelMapping.maxMembers) || 3);
        const isSolo = max === 1;
        return {
          ten_do_an: title,
          noi_dung_muc_tieu: desc || undefined,
          quy_mo: isSolo ? 'ca_nhan' : 'nhom',
          so_luong_toi_da: max,
          is_unlimited: false
        };
      }).filter(t => t.ten_do_an.length > 0);
    } else if (topicInputMode === 'bulk') {
      if (!bulkText.trim()) {
        alert('Vui lòng dán danh sách đề tài hoặc chuyển sang tab Nhập theo danh sách!');
        return;
      }
      const lines = bulkText
        .split('\n')
        .map(l => l.trim().replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
        .filter(l => l.length > 0);
      formattedTopics = lines.map((line, idx) => {
        let isSolo = bulkDefaultScale === 'ca_nhan';
        if (bulkDefaultScale === 'alternate') {
          isSolo = idx % 2 !== 0;
        }
        return {
          ten_do_an: line,
          quy_mo: isSolo ? 'ca_nhan' : 'nhom',
          so_luong_toi_da: isSolo ? 1 : 3,
          is_unlimited: false,
          noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}".`
        };
      });
    } else {
      // mode 'rows'
      formattedTopics = topicRows
        .filter(r => r.ten_do_an && r.ten_do_an.trim())
        .map(r => {
          const max = Math.max(1, Number(r.so_luong_toi_da) || 3);
          const isSolo = max === 1;
          return {
            ten_do_an: r.ten_do_an.trim(),
            quy_mo: isSolo ? 'ca_nhan' : 'nhom',
            so_luong_toi_da: max,
            is_unlimited: false,
            noi_dung_muc_tieu: r.noi_dung_muc_tieu ? r.noi_dung_muc_tieu.trim() : undefined
          };
        });
    }

    if (formattedTopics.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên đề tài hợp lệ!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ten_mon_hoc: `Môn: ${currentClassInfo.ten_mon_hoc} • ${currentClassInfo.ten_lop}`,
        ma_giang_vien: 'u-gv-01',
        topics: formattedTopics
      };

      await createTopic(payload);

      // Reset về trạng thái mặc định
      setTopicRows([
        { id: 1, ten_do_an: '', so_luong_toi_da: 3, noi_dung_muc_tieu: '' },
        { id: 2, ten_do_an: '', so_luong_toi_da: 1, noi_dung_muc_tieu: '' }
      ]);
      setBulkText('');
      setExcelFile(null);
      setExcelHeaders([]);
      setExcelRows([]);
      setTopicInputMode('rows');
      setIsCreateTopicModalOpen(false);
      alert(`Đã công bố thành công ${formattedTopics.length} đề tài vào Ngân hàng lớp học!`);
    } catch (err) {
      alert(`Lỗi công bố đề tài: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal nhận đề tài cá nhân (1 Sinh viên)
  const handleOpenSoloConfirm = (topic) => {
    // Mặc định chọn SV đang đăng nhập (nếu chưa có nhóm) hoặc SV đầu tiên chưa có nhóm
    let defaultSvId = '';
    if (!isLecturer && currentUser && !assignedStudentMap[currentUser.ma_nguoi_dung]) {
      defaultSvId = currentUser.ma_nguoi_dung;
    } else {
      const firstAvailable = students.find(s => !assignedStudentMap[s.ma_nguoi_dung]);
      defaultSvId = firstAvailable ? firstAvailable.ma_nguoi_dung : (students[0]?.ma_nguoi_dung || '');
    }
    setSoloStudentId(defaultSvId);
    setSoloConfirmTopic(topic);
  };

  const handleConfirmSoloSubmit = async (e) => {
    e.preventDefault();
    if (!soloConfirmTopic) return;
    const targetSvId = currentAssignedStudent?.ma_nguoi_dung || soloStudentId;
    if (!targetSvId) {
      alert('Không xác định được sinh viên nhận đề tài!');
      return;
    }
    if (assignedStudentMap[targetSvId]) {
      alert(`Bạn đã thuộc nhóm "${assignedStudentMap[targetSvId].ten_nhom}". Không thể nhận thêm đề tài!`);
      return;
    }
    try {
      setSubmitting(true);
      await registerSoloTopic(soloConfirmTopic.ma_do_an, targetSvId);
      if (!isLecturer) setCurrentUserId(targetSvId);
      setSoloConfirmTopic(null);
    } catch (err) {
      alert(`Lỗi nhận đề tài cá nhân: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal lập nhóm
  const handleOpenTeamModal = (topic) => {
    if (!topic) return;

    // Yêu cầu cốt lõi: Nếu đề tài chỉ cho 1 sinh viên, CHỈ hiển thị xác nhận nhận đề tài, không mở modal lập nhóm!
    if (topic.so_luong_toi_da === 1 || topic.quy_mo === 'ca_nhan') {
      return handleOpenSoloConfirm(topic);
    }

    // Task B3: Lọc loại trừ sinh viên đã có nhóm bằng assignedStudentMap
    const unassigned = students.filter(s => !assignedStudentMap[s.ma_nguoi_dung]);

    let defaultMembers = [];
    let defaultLeader = '';

    if (!isLecturer && currentUser && !assignedStudentMap[currentUser.ma_nguoi_dung]) {
      defaultLeader = currentUser.ma_nguoi_dung;
      const partner = unassigned.find(s => s.ma_nguoi_dung !== currentUser.ma_nguoi_dung);
      defaultMembers = partner ? [currentUser.ma_nguoi_dung, partner.ma_nguoi_dung] : [currentUser.ma_nguoi_dung];
    } else if (unassigned.length >= 2) {
      defaultLeader = unassigned[0].ma_nguoi_dung;
      defaultMembers = [unassigned[0].ma_nguoi_dung, unassigned[1].ma_nguoi_dung];
    } else if (unassigned.length === 1) {
      defaultLeader = unassigned[0].ma_nguoi_dung;
      defaultMembers = [unassigned[0].ma_nguoi_dung];
    } else {
      defaultLeader = '';
      defaultMembers = [];
    }

    const nextNum = registeredGroups.filter(g => g.quy_mo === 'nhom').length + 5;
    setTeamForm({
      ten_nhom: `Nhóm Đồ án Môn học 0${nextNum}`,
      leaderId: defaultLeader,
      memberIds: defaultMembers
    });
    setTeamModalTopic(topic);
  };

  const handleToggleMember = (studentId) => {
    // Chặn tuyệt đối nếu sinh viên đã có nhóm
    if (assignedStudentMap[studentId]) {
      alert(`Sinh viên này đã thuộc ${assignedStudentMap[studentId].ten_nhom}. Không thể chọn vào nhóm mới!`);
      return;
    }

    setTeamForm(prev => {
      const exists = prev.memberIds.includes(studentId);
      let nextMembers = exists ? prev.memberIds.filter(id => id !== studentId) : [...prev.memberIds, studentId];
      // Task B2: Kiểm tra số lượng thành viên linh hoạt
      const maxLimit = teamModalTopic?.so_luong_toi_da || 3;
      if (nextMembers.length > maxLimit) {
        alert(`Đề tài này chỉ cho phép tối đa ${maxLimit} sinh viên!`);
        return prev;
      }
      let nextLeader = prev.leaderId;
      if (!nextMembers.includes(nextLeader)) {
        nextLeader = nextMembers[0] || '';
      }
      return { ...prev, memberIds: nextMembers, leaderId: nextLeader };
    });
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamModalTopic) return;
    if (!teamForm.ten_nhom.trim()) {
      alert('Vui lòng đặt tên nhóm!');
      return;
    }
    // Task B2: Cho phép tối thiểu 1 sinh viên (nếu 1 người tự động làm nhóm trưởng)
    if (teamForm.memberIds.length < 1) {
      alert('Đề tài nhóm cần tối thiểu 1 sinh viên tham gia!');
      return;
    }
    try {
      setSubmitting(true);
      const effectiveLeaderId = teamForm.leaderId || teamForm.memberIds[0];
      await registerTeamTopic(teamModalTopic.ma_do_an, {
        ten_nhom: teamForm.ten_nhom.trim(),
        leaderId: effectiveLeaderId,
        memberIds: teamForm.memberIds
      });
      if (!isLecturer) setCurrentUserId(effectiveLeaderId);
      setTeamModalTopic(null);
    } catch (err) {
      alert(`Lỗi đăng ký nhóm: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="classroom-portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '36px' }}>

      {/* =====================================================================
          1. HEADER BANNER (GVPTMH: TỐI GIẢN HỌC THUẬT · SV: THÂN THIỆN)
         ===================================================================== */}
      <div
        data-tour-id="tour-class-selector"
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderTop: isLecturer ? '1px solid var(--border)' : '3px solid #2563eb',
          borderRadius: '12px',
          padding: isLecturer ? '16px 20px' : '16px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {!isLecturer && chibiMode && (
              <img
                src={hasEnrolledProject ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.characters.chiaTask}
                alt="Portal Mascot"
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  background: '#eff6ff',
                  borderRadius: '10px',
                  padding: '4px',
                  border: '1px solid #bfdbfe',
                  flexShrink: 0
                }}
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {!isLecturer && (
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    SINH VIÊN
                  </span>
                )}
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                  {currentClassInfo.ten_lop}
                </h2>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  &bull; {currentClassInfo.ten_mon_hoc} &bull; {currentClassInfo.hoc_ky}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '3px' }}>
                GVHD: <strong style={{ color: 'var(--text)' }}>ThS. Bùi Phú Khuyên</strong> &bull; Sĩ số: <strong style={{ color: 'var(--text)' }}>{students.length} SV</strong>
              </div>
            </div>
          </div>

          {/* Chọn Lớp & Tác vụ cấp lớp cho Giảng viên */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={activeClassId}
              onChange={e => setActiveClassId(e.target.value)}
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {classes.map(c => (
                <option key={c.ma_lop} value={c.ma_lop}>
                  {c.ten_lop} ({c.hoc_ky})
                </option>
              ))}
            </select>

            {isLecturer && (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsCreateClassModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  + Tạo Lớp
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  data-tour-id="tour-gv-add-topics"
                  onClick={() => setIsCreateTopicModalOpen(true)}
                  style={{ fontWeight: 700 }}
                >
                  + Thêm Đề tài
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1 DÒNG TÓM TẮT SỐ LIỆU TOÀN LỚP (THAY THẾ 4 Ô KPI TO) */}
        {isLecturer && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <span>Tổng đề tài: <strong style={{ color: 'var(--text)' }}>{topics.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Đang thực hiện: <strong style={{ color: '#15803d' }}>{registeredGroups.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Còn trống: <strong style={{ color: 'var(--text)' }}>{openTopics.length}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Tiến độ TB lớp: <strong style={{ color: '#1d4ed8' }}>{averageClassProgress}%</strong></span>
            </div>

            {unassignedStudents.length > 0 ? (
              <button
                type="button"
                onClick={() => setLecturerFilter('unassigned_sv')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#b45309',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {unassignedStudents.length}/{students.length} SV chưa có nhóm
              </button>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                100% SV đã có nhóm
              </span>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          2. NỘI DUNG CHÍNH
         ===================================================================== */}

      {isLecturer ? (
        /* -------------------------------------------------------------------
           A. GIAO DIỆN GIẢNG VIÊN: 1 BẢNG TỔNG HỢP LỚP DUY NHẤT (SIÊU TỐI GIẢN)
           ------------------------------------------------------------------- */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Thanh lọc nhanh + tìm kiếm gọn trên đầu bảng */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`tab-btn ${lecturerFilter === 'all' ? 'active' : ''}`}
                data-tour-id="tour-gv-groups-tab"
                onClick={() => setLecturerFilter('all')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Tất cả ({topics.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'active' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('active')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Đang làm ({registeredGroups.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'open' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('open')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                Còn trống ({openTopics.length})
              </button>
              <button
                className={`tab-btn ${lecturerFilter === 'unassigned_sv' ? 'active' : ''}`}
                onClick={() => setLecturerFilter('unassigned_sv')}
                style={{ padding: '5px 11px', fontSize: '12px', fontWeight: 600 }}
              >
                SV chưa nhóm ({unassignedStudents.length})
              </button>
            </div>

            <input
              type="text"
              className="form-control"
              placeholder={lecturerFilter === 'unassigned_sv' ? 'Tìm tên hoặc email SV...' : 'Tìm đề tài, nhóm, trưởng nhóm...'}
              value={lecturerSearch}
              onChange={e => setLecturerSearch(e.target.value)}
              style={{ width: '240px', maxWidth: '100%', padding: '5px 10px', fontSize: '12.5px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            {lecturerFilter === 'unassigned_sv' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px', width: '48px' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>Họ và tên</th>
                    <th style={{ padding: '10px 14px' }}>Email</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnassignedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                        {unassignedStudents.length === 0
                          ? 'Tất cả sinh viên trong lớp đều đã tham gia nhóm.'
                          : 'Không tìm thấy sinh viên phù hợp.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUnassignedStudents.map((sv, idx) => (
                      <tr key={sv.ma_nguoi_dung} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-subtle)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>{sv.ho_ten}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{sv.email}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#b45309', fontSize: '12px', fontWeight: 600 }}>
                          Chưa có nhóm
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Đề tài &amp; Nhóm</th>
                    <th style={{ padding: '10px 14px', width: '210px' }}>Trưởng nhóm &amp; Sĩ số</th>
                    <th style={{ padding: '10px 14px', width: '140px' }}>Tiến độ</th>
                    <th style={{ padding: '10px 14px', width: '120px' }}>GitHub</th>
                    <th style={{ padding: '10px 14px', width: '84px', textAlign: 'right' }}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLecturerTopics.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                        Không có đề tài phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredLecturerTopics.map((topic, idx) => {
                      const pct = Number(topic.tien_do_tong || 0).toFixed(0);
                      const gh = topic.github_summary;
                      const members = topic.team?.members || [];
                      const leader = members.find(m => m.vai_tro_trong_nhom === 'nhom_truong') || members[0];
                      return (
                        <tr
                          key={topic.ma_do_an}
                          onClick={() => setDetailTopicModal(topic)}
                          style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '11px 14px', maxWidth: '420px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>
                              <span style={{ color: 'var(--text-subtle)', marginRight: '6px', fontWeight: 500 }}>{idx + 1}.</span>
                              {topic.ten_do_an}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {topic.da_dang_ky
                                ? `${topic.team?.ten_nhom} · ${topic.quy_mo === 'ca_nhan' ? 'Cá nhân' : 'Nhóm'}`
                                : `Chưa có nhóm · ${topic.quy_mo === 'ca_nhan' ? 'Cá nhân (1 SV)' : 'Nhóm'}`}
                            </div>
                          </td>

                          <td style={{ padding: '11px 14px', color: 'var(--text)', fontSize: '12.5px' }}>
                            {topic.da_dang_ky && leader ? (
                              <span>
                                {leader.ho_ten}{' '}
                                <span style={{ color: 'var(--text-muted)' }}>({members.length} SV)</span>
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-subtle)' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px' }}>
                            {topic.da_dang_ky ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '5px', background: '#e4e4e7', borderRadius: '99px', overflow: 'hidden', minWidth: '64px' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: '#16a34a' }} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', minWidth: '32px', textAlign: 'right' }}>
                                  {pct}%
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Còn trống</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            {topic.da_dang_ky ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  enterWorkspace(topic.ma_do_an, 'github');
                                }}
                                style={{ fontSize: '11.5px', padding: '3px 8px', color: gh?.connected ? 'var(--text)' : 'var(--text-subtle)' }}
                              >
                                {gh?.connected
                                  ? (gh.commit_count > 0 ? `${gh.commit_count} commits` : 'Đã gắn')
                                  : 'Chưa gắn'}
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-subtle)' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailTopicModal(topic);
                              }}
                              style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                            >
                              Xem
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------------
           B. GIAO DIỆN SINH VIÊN TINH GỌN (STUDENT PORTAL)
           ------------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* KHỐI 1: VIỆC CỦA BẠN LÚC NÀY */}
          {hasEnrolledProject ? (
            <div
              data-tour-id="tour-sv-status-card"
              style={{
                background: 'var(--surface-raised)',
                borderRadius: '12px',
                padding: '18px 22px',
                border: '1px solid var(--border)',
                borderLeft: '4px solid #2563eb',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
                    ✓ ĐỀ TÀI CỦA BẠN
                  </span>
                  <span style={{ background: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#fef3c7' : '#f4f4f5', color: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#b45309' : '#52525b', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    {currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '⭐ Nhóm trưởng' : 'Thành viên'}
                  </span>
                  <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    Tiến độ: {Number(studentProject.tien_do_tong || 0).toFixed(0)}%
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
                  {studentProject.ten_do_an}
                </h3>
                <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>
                  {studentProject.ten_nhom}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => enterWorkspace(studentProject.ma_do_an, 'github')}
                  style={{ fontWeight: 700, padding: '8px 12px' }}
                >
                  🐙 GitHub Nhóm
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => enterWorkspace(studentProject.ma_do_an, 'kanban')}
                  style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 700, padding: '8px 16px' }}
                >
                  🚀 Vào Bảng việc Kanban &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div
              data-tour-id="tour-sv-status-card"
              style={{
                background: 'var(--surface)',
                border: '1.5px dashed #f59e0b',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
                  CHƯA CÓ ĐỀ TÀI
                </span>
                <h3 style={{ margin: '6px 0 4px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  Hãy chọn đề tài cá nhân hoặc lập nhóm để bắt đầu
                </h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Hiện còn <strong>{openTopics.length}</strong> đề tài đang mở trong lớp {currentClassInfo.ten_lop}.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const firstSolo = openTopics.find(t => t.quy_mo === 'ca_nhan') || openTopics[0];
                    if (firstSolo) handleOpenSoloConfirm(firstSolo);
                    else alert('Hiện chưa có đề tài còn trống!');
                  }}
                  style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 700, padding: '8px 14px' }}
                >
                  ⚡ Nhận Đề tài Cá nhân
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const firstTeam = openTopics.find(t => t.quy_mo === 'nhom') || openTopics[0];
                    if (firstTeam) handleOpenTeamModal(firstTeam);
                    else alert('Hiện chưa có đề tài còn trống!');
                  }}
                  style={{ background: '#7c3aed', borderColor: '#7c3aed', fontWeight: 700, padding: '8px 14px' }}
                >
                  👥 Lập Nhóm &amp; Đăng ký
                </button>
              </div>
            </div>
          )}

          {/* KHỐI 2: NGÂN HÀNG ĐỀ TÀI RÚT GỌN (DỄ NHÌN, BẤM CHI TIẾT ĐỂ XEM MÔ TẢ) */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>
                📚 Ngân hàng Đề tài ({topics.length})
              </h4>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all', label: `Tất cả (${topics.length})` },
                  { id: 'open', label: `Còn trống (${openTopics.length})` },
                  { id: 'taken', label: `Đã có nhóm (${registeredGroups.length})` }
                ].map(f => (
                  <button
                    key={f.id}
                    className={`tab-btn ${studentTopicFilter === f.id ? 'active' : ''}`}
                    onClick={() => setStudentTopicFilter(f.id)}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {topics
                .filter(t => {
                  if (studentTopicFilter === 'open') return !t.da_dang_ky;
                  if (studentTopicFilter === 'taken') return t.da_dang_ky;
                  return true;
                })
                .map(t => {
                  const scaleInfo = getTopicScaleInfo(t);
                  const isMyProject = hasEnrolledProject && (studentProject?.ma_do_an === t.ma_do_an);
                  const isSolo = scaleInfo.isSolo || (t.so_luong_toi_da === 1) || (t.quy_mo === 'ca_nhan');
                  const isRegistered = t.da_dang_ky;

                  return (
                    <div
                      key={t.ma_do_an}
                      style={{
                        border: isMyProject ? '2px solid #2563eb' : '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        background: isMyProject ? '#f8faff' : 'var(--surface-raised)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: scaleInfo.color,
                              background: scaleInfo.bg,
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}
                          >
                            {scaleInfo.label}
                          </span>

                          {isMyProject ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '999px' }}>
                              ⭐ Của bạn &bull; {Number(t.tien_do_tong || 0).toFixed(0)}%
                            </span>
                          ) : isRegistered ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: '999px' }}>
                              ✓ {t.team?.ten_nhom} ({Number(t.tien_do_tong || 0).toFixed(0)}%)
                            </span>
                          ) : (
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '999px' }}>
                              🟢 Còn trống
                            </span>
                          )}
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', lineHeight: 1.35 }}>
                          {t.ten_do_an}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setDetailTopicModal(t)}
                          style={{ fontSize: '11.5px', padding: '5px 10px' }}
                        >
                          Chi tiết
                        </button>

                        {isRegistered ? (
                          <button
                            className={isMyProject ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                            onClick={() => enterWorkspace(t.ma_do_an, 'kanban')}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              background: isMyProject ? '#2563eb' : undefined,
                              color: isMyProject ? '#fff' : '#1d4ed8',
                              borderColor: isMyProject ? '#2563eb' : '#93c5fd'
                            }}
                          >
                            {isMyProject ? '🚀 Vào Kanban →' : '👀 Xem nhóm →'}
                          </button>
                        ) : !hasEnrolledProject ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => isSolo ? handleOpenSoloConfirm(t) : handleOpenTeamModal(t)}
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              background: isSolo ? '#0284c7' : '#7c3aed',
                              borderColor: isSolo ? '#0284c7' : '#7c3aed'
                            }}
                          >
                            {isSolo ? '⚡ Xác nhận nhận đề tài' : '👥 Lập nhóm'}
                          </button>
                        ) : (
                          <span style={{ flex: 1, textAlign: 'right', fontSize: '11px', color: 'var(--text-subtle)' }}>
                            Chờ SV khác chọn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL A: TẠO LỚP MÔN HỌC MỚI (DÀNH CHO GVPTMH)
         ===================================================================== */}
      {isCreateClassModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateClassModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>🏫 Giảng viên Tạo Lớp Môn học Mới</h3>
              <button className="drawer-close-btn" onClick={() => setIsCreateClassModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClassSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Mã lớp học phần (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: 21DTHC6 hoặc 22DTHE9"
                    value={classForm.ma_lop}
                    onChange={e => setClassForm(prev => ({ ...prev, ma_lop: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên môn học</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.ten_mon_hoc}
                    onChange={e => setClassForm(prev => ({ ...prev, ten_mon_hoc: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Học kỳ / Niên khóa</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.hoc_ky}
                    onChange={e => setClassForm(prev => ({ ...prev, hoc_ky: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả lớp học phần</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Mô tả thông tin phòng máy, lịch học..."
                    value={classForm.mo_ta}
                    onChange={e => setClassForm(prev => ({ ...prev, mo_ta: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateClassModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : '+ Hoàn tất Tạo Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL B: GIẢNG VIÊN TẠO NHIỀU ĐỀ TÀI CÙNG LÚC VÀO NGÂN HÀNG CỦA LỚP
         ===================================================================== */}
      {isCreateTopicModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateTopicModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw' }}>
            <div className="modal-header" style={{ paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  📚 GVPTMH Thêm Đề tài vào Ngân hàng ({currentClassInfo.ten_lop})
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cho phép nhập nhiều đề tài cùng lúc để sinh viên trong lớp chọn làm đề tài Cá nhân (1 SV) hoặc Nhóm (2-3 SV).
                </p>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsCreateTopicModalOpen(false)}>✕</button>
            </div>

            {/* Thanh chuyển chế độ nhập: Nhập danh sách vs Dán hàng loạt vs Import Excel */}
            <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', paddingBottom: '8px' }}>
                <button
                  type="button"
                  data-tour-id="tab-manual-topic"
                  className={`tab-btn ${topicInputMode === 'rows' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('rows')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📝 Nhập theo danh sách ({topicRows.length} dòng)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${topicInputMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('bulk')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📋 Dán nhanh hàng loạt (Bulk Paste)
                </button>
                <button
                  type="button"
                  data-tour-id="tab-import-excel"
                  className={`tab-btn ${topicInputMode === 'excel' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('excel')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 700, color: topicInputMode === 'excel' ? '#15803d' : undefined }}
                >
                  📊 Import từ Excel / CSV
                </button>
              </div>

              {topicInputMode === 'rows' && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleLoadSampleTopics}
                  title="Tự động điền 4 đề tài mẫu thực tế chuẩn Công nghệ phần mềm"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#2563eb',
                    borderColor: '#bfdbfe',
                    background: '#eff6ff',
                    padding: '4px 10px'
                  }}
                >
                  ✨ Nạp 4 đề tài mẫu gợi ý
                </button>
              )}
            </div>

            <form onSubmit={handleCreateTopicSubmit}>
              <div className="modal-body" style={{ maxHeight: '56vh', overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* ---------------- CHẾ ĐỘ 1: NHẬP THEO DANH SÁCH TỪNG DÒNG ---------------- */}
                {topicInputMode === 'rows' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                        Danh sách các đề tài chuẩn bị công bố:
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleAddTopicRow}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff' }}
                      >
                        + Thêm dòng đề tài
                      </button>
                    </div>

                    {topicRows.map((row, idx) => (
                      <div
                        key={row.id}
                        style={{
                          background: 'var(--surface-raised)',
                          border: '1px solid var(--border)',
                          borderLeft: row.so_luong_toi_da === 1 ? '4px solid #0284c7' : '4px solid #7c3aed',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        {/* Header của từng dòng đề tài: STT + Chọn Quy mô linh hoạt + Nút Xóa */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>
                            Đề tài #{idx + 1}
                          </span>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--surface-subtle)', borderRadius: '8px', padding: '4px 10px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Quy mô:</span>
                              <span style={{ fontWeight: 800, color: (row.so_luong_toi_da || 1) === 1 ? '#0284c7' : '#7c3aed', background: (row.so_luong_toi_da || 1) === 1 ? '#e0f2fe' : '#f3e8ff', padding: '1px 6px', borderRadius: '4px' }}>
                                {(row.so_luong_toi_da || 1) === 1 ? 'Cá nhân (1 SV)' : `Nhóm (1-${row.so_luong_toi_da || 3} SV)`}
                              </span>
                            </div>

                            {/* Bộ điều khiển tự động nâng / hạ quy mô */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <button
                                type="button"
                                title="Hạ quy mô sinh viên (-1)"
                                onClick={() => handleUpdateTopicRow(row.id, 'so_luong_toi_da', Math.max(1, (Number(row.so_luong_toi_da) || 3) - 1))}
                                style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                data-tour-id="topic-max-members-input"
                                min="1"
                                max="50"
                                value={row.so_luong_toi_da || 1}
                                onChange={e => {
                                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                  handleUpdateTopicRow(row.id, 'so_luong_toi_da', val);
                                }}
                                style={{
                                  width: '44px',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border)',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  textAlign: 'center'
                                }}
                              />
                              <button
                                type="button"
                                title="Nâng quy mô sinh viên (+1)"
                                onClick={() => handleUpdateTopicRow(row.id, 'so_luong_toi_da', Math.min(50, (Number(row.so_luong_toi_da) || 1) + 1))}
                                style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}
                              >
                                +
                              </button>
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>SV</span>
                            </div>

                            {/* Nút xóa dòng nếu có từ 2 dòng trở lên */}
                            {topicRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicRow(row.id)}
                                title="Xóa dòng đề tài này"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  marginLeft: '4px'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tên đề tài */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Tên đề tài đồ án môn học (*)..."
                            value={row.ten_do_an}
                            onChange={e => handleUpdateTopicRow(row.id, 'ten_do_an', e.target.value)}
                            required
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        {/* Mô tả ngắn */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Mô tả mục tiêu / yêu cầu chính (tùy chọn)..."
                            value={row.noi_dung_muc_tieu}
                            onChange={e => handleUpdateTopicRow(row.id, 'noi_dung_muc_tieu', e.target.value)}
                            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddTopicRow}
                      style={{
                        borderStyle: 'dashed',
                        borderColor: '#93c5fd',
                        color: '#2563eb',
                        justifyContent: 'center',
                        fontWeight: 700,
                        padding: '10px'
                      }}
                    >
                      + Thêm dòng đề tài thứ {topicRows.length + 1}
                    </button>
                  </div>
                )}

                {/* ---------------- CHẾ ĐỘ 2: DÁN VĂN BẢN HÀNG LOẠT ---------------- */}
                {topicInputMode === 'bulk' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1d4ed8' }}>
                      💡 <strong>Mẹo giảng viên:</strong> Copy danh sách đề tài từ Word/Excel hoặc File ghi chú rồi dán vào khung dưới đây. Hệ thống sẽ tự động bóc tách từng dòng thành các đề tài riêng biệt!
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Quy mô áp dụng mặc định:</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'nhom' ? '2px solid #7c3aed' : '1px solid var(--border)', background: bulkDefaultScale === 'nhom' ? '#faf5ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'nhom'} onChange={() => setBulkDefaultScale('nhom')} />
                          <span>👥 Tất cả là Nhóm</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'ca_nhan' ? '2px solid #0284c7' : '1px solid var(--border)', background: bulkDefaultScale === 'ca_nhan' ? '#f0f9ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'ca_nhan'} onChange={() => setBulkDefaultScale('ca_nhan')} />
                          <span>👤 Tất cả là Cá nhân</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'alternate' ? '2px solid #2563eb' : '1px solid var(--border)', background: bulkDefaultScale === 'alternate' ? '#eff6ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'alternate'} onChange={() => setBulkDefaultScale('alternate')} />
                          <span>⚡ Đan xen 50/50</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dán danh sách đề tài (mỗi dòng 1 đề tài):</label>
                      <textarea
                        className="form-textarea"
                        rows="7"
                        placeholder="Ví dụ:&#10;1. Xây dựng cổng tra cứu thông tin học vụ và lịch thi&#10;2. Hệ thống quản lý điểm rèn luyện sinh viên&#10;3. Ứng dụng theo dõi chứng chỉ tốt nghiệp cá nhân&#10;4. Nền tảng chia sẻ tài liệu ôn tập trực tuyến..."
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.5 }}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleParseBulkText}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8' }}
                      >
                        ⚡ Chuyển thành danh sách để xem & chỉnh sửa &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------- CHẾ ĐỘ 3: IMPORT TỪ FILE EXCEL / CSV (TASK B4) ---------------- */}
                {topicInputMode === 'excel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#166534' }}>
                      📊 <strong>Import từ Excel / CSV của Giảng viên:</strong> Chọn file danh sách đề tài riêng (.xlsx, .xls, .csv). Hệ thống hỗ trợ đọc cả file chỉ có duy nhất cột Tên đề tài và tự động lọc tiêu đề.
                    </div>

                    {/* Khung tải file Dropzone */}
                    <div
                      data-tour-id="excel-dropzone"
                      style={{
                        border: '2px dashed #86efac',
                        borderRadius: '10px',
                        padding: '24px 16px',
                        background: '#f8fafc',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => document.getElementById('excelFileInput')?.click()}
                    >
                      <input
                        id="excelFileInput"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        onChange={handleExcelFileUpload}
                      />
                      <div style={{ fontSize: '32px', marginBottom: '6px' }}>📑</div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                        {excelFile ? `Đã nạp file: ${excelFile.name} (${(excelFile.size / 1024).toFixed(1)} KB)` : 'Nhấp vào đây để chọn File Excel / CSV (.xlsx, .xls, .csv)'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Tự động phân tích sheet đầu tiên & hiển thị giao diện ánh xạ cột bên dưới
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '-4px' }}>
                      <a
                        href="/danh-sach-de-tai-mau.xlsx"
                        download="danh-sach-de-tai-mau.xlsx"
                        style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'underline', fontWeight: 600 }}
                        onClick={e => e.stopPropagation()}
                      >
                        📥 Tải file Excel mẫu (.xlsx) để test thử
                      </a>
                    </div>

                    {excelError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#b91c1c' }}>
                        ⚠️ {excelError}
                      </div>
                    )}

                    {excelHeaders.length > 0 && (
                      <div data-tour-id="excel-column-mapping" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                          🔍 Ánh xạ Cột & Cấu hình Nhóm cho Đề tài Import
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                              Cột Tên đề tài (* Bắt buộc):
                            </label>
                            <select
                              className="form-select"
                              value={excelMapping.topicCol}
                              onChange={e => setExcelMapping(prev => ({ ...prev, topicCol: e.target.value }))}
                              style={{ fontSize: '12px', fontWeight: 600 }}
                            >
                              {excelHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                              Cột Mô tả / Thông tin:
                            </label>
                            <select
                              className="form-select"
                              value={excelMapping.descCol}
                              onChange={e => setExcelMapping(prev => ({ ...prev, descCol: e.target.value }))}
                              style={{ fontSize: '12px' }}
                            >
                              <option value="__NONE__">(Không có / Bỏ qua cột này)</option>
                              {excelHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                              Quy định Số lượng SV cho đề tài:
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Tối đa:</span>
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={excelMapping.maxMembers}
                                onChange={e => setExcelMapping(prev => ({ ...prev, maxMembers: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                                style={{ width: '56px', padding: '3px 6px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700 }}
                              />
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>SV / nhóm</span>
                            </div>
                          </div>
                        </div>

                        {/* Bảng xem trước dữ liệu Preview */}
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Xem trước các dòng đầu tiên (Tổng cộng: {excelRows.length} dòng dữ liệu):
                          </div>
                          <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
                            <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '40px' }}>STT</th>
                                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Tên đề tài trích xuất</th>
                                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '140px' }}>Quy mô áp dụng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {excelRows.slice(0, 5).map((r, i) => {
                                  const tCol = excelHeaders.indexOf(excelMapping.topicCol);
                                  const title = tCol >= 0 ? String(r[tCol] || '').trim() : '';
                                  return (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{title || <em style={{ color: '#ef4444' }}>(Dòng trống)</em>}</td>
                                      <td style={{ padding: '6px 10px', color: '#7c3aed', fontWeight: 600 }}>
                                        {excelMapping.maxMembers === 1 ? 'Cá nhân (1 SV)' : `Nhóm (${excelMapping.maxMembers} SV)`}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {topicInputMode === 'excel' ? (
                    <span>
                      {excelRows.length > 0
                        ? `Sẵn sàng công bố ${excelRows.filter(r => {
                            const tCol = excelHeaders.indexOf(excelMapping.topicCol);
                            return tCol >= 0 && String(r[tCol] || '').trim();
                          }).length} đề tài từ file Excel`
                        : 'Chưa có file Excel được tải lên'}
                    </span>
                  ) : topicInputMode === 'rows' ? (
                    <span>
                      Đang chuẩn bị <strong>{topicRows.filter(r => r.ten_do_an.trim()).length}</strong> đề tài cho lớp
                    </span>
                  ) : (
                    <span>
                      {bulkText.trim().split('\n').filter(l => l.trim()).length > 0
                        ? `Tìm thấy ${bulkText.trim().split('\n').filter(l => l.trim()).length} dòng đề tài`
                        : 'Chưa có nội dung dán'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateTopicModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang tạo...' : '+ Công bố Danh sách Đề tài'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL C: SINH VIÊN NHẬN ĐỀ TÀI CÁ NHÂN (1 NGƯỜI)
         ===================================================================== */}
      {soloConfirmTopic && (
        <div className="modal-backdrop open" onClick={() => setSoloConfirmTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>⚡ Xác nhận Nhận Đề tài (1 Sinh viên)</h3>
              <button className="drawer-close-btn" onClick={() => setSoloConfirmTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmSoloSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    ĐỀ TÀI CÁ NHÂN (1 NGƯỜI THỰC HIỆN)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', marginTop: '4px' }}>
                    {soloConfirmTopic.ten_do_an}
                  </div>
                </div>
                {/* Thông tin sinh viên nhận đề tài: Tự động gán cho tài khoản đang thao tác (Không cần chọn thủ công) */}
                <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                    {getInitials(currentAssignedStudent?.ho_ten || 'SV')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                      Sinh viên thực hiện đề tài:
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                      {currentAssignedStudent?.ho_ten || 'Sinh viên'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {currentAssignedStudent?.email || ''}
                    </div>
                  </div>
                  {assignedStudentMap[currentAssignedStudent?.ma_nguoi_dung] && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>
                      🔒 Đã thuộc {assignedStudentMap[currentAssignedStudent?.ma_nguoi_dung].ten_nhom}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                  ℹ️ Bạn sẽ là người duy nhất quản lý tiến độ cho đề tài này và làm việc trực tiếp với Giảng viên.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSoloConfirmTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
                  {submitting ? 'Đang xử lý...' : '⚡ Xác nhận Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL D: SINH VIÊN LẬP NHÓM & ĐĂNG KÝ ĐỀ TÀI NHÓM
         ===================================================================== */}
      {teamModalTopic && (
        <div className="modal-backdrop open" onClick={() => setTeamModalTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>👥 Thiết lập Nhóm & Đăng ký Đề tài</h3>
              <button className="drawer-close-btn" onClick={() => setTeamModalTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                      {teamModalTopic.so_luong_toi_da === 1 ? 'Đề tài Cá nhân (1 Sinh viên)' : `Đề tài Nhóm (Tối đa ${teamModalTopic.so_luong_toi_da || 3} Sinh viên)`}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: teamForm.memberIds.length <= 1 ? '#0284c7' : '#7c3aed', background: teamForm.memberIds.length <= 1 ? '#e0f2fe' : '#f3e8ff', padding: '2px 8px', borderRadius: '999px' }}>
                      Quy mô nhóm: {teamForm.memberIds.length <= 1 ? 'Cá nhân (1 SV)' : `Nhóm (${teamForm.memberIds.length} SV)`}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4c1d95', marginTop: '3px' }}>
                    {teamModalTopic.ten_do_an}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">1. Đặt Tên Nhóm Đồ án (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nhóm Đồ án Môn học 06"
                    value={teamForm.ten_nhom}
                    onChange={e => setTeamForm(prev => ({ ...prev, ten_nhom: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>2. Chọn Thành viên & Chỉ định ai là Nhóm trưởng (*)</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>
                      Đang chọn: {teamForm.memberIds.length} / {teamModalTopic.so_luong_toi_da || 3} SV
                    </span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {students.map(sv => {
                      // Kiểm tra xem sinh viên đã có nhóm hoặc đã nhận đề tài hay chưa bằng assignedStudentMap
                      const assignedInfo = assignedStudentMap[sv.ma_nguoi_dung];
                      const isAlreadyAssigned = Boolean(assignedInfo);
                      const isSelected = teamForm.memberIds.includes(sv.ma_nguoi_dung);
                      const isLeaderSelected = teamForm.leaderId === sv.ma_nguoi_dung;
                      return (
                        <div
                          key={sv.ma_nguoi_dung}
                          data-tour-id={isAlreadyAssigned ? "team-member-disabled" : undefined}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: isAlreadyAssigned 
                              ? '1px dashed #cbd5e1' 
                              : (isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border)'),
                            background: isAlreadyAssigned 
                              ? 'var(--surface-subtle, #f8fafc)' 
                              : (isSelected ? '#faf5ff' : 'var(--surface)'),
                            opacity: isAlreadyAssigned ? 0.45 : 1,
                            pointerEvents: isAlreadyAssigned ? 'none' : 'auto',
                            cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer',
                            userSelect: 'none'
                          }}
                          onClick={() => {
                            if (!isAlreadyAssigned) handleToggleMember(sv.ma_nguoi_dung);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={!isAlreadyAssigned && isSelected}
                              disabled={isAlreadyAssigned}
                              onChange={() => { }}
                              style={{ accentColor: '#7c3aed', cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px', color: isAlreadyAssigned ? '#94a3b8' : 'inherit' }}>
                                  {sv.ho_ten}
                                </span>
                                {isAlreadyAssigned && (
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                                    🔒 Đã thuộc {assignedInfo.ten_nhom}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sv.email}</div>
                            </div>
                          </div>

                          {isSelected && !isAlreadyAssigned && (
                            <div onClick={e => e.stopPropagation()}>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: isLeaderSelected ? '#b45309' : '#475569', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="portalLeaderRadio"
                                  checked={isLeaderSelected}
                                  onChange={() => setTeamForm(prev => ({ ...prev, leaderId: sv.ma_nguoi_dung }))}
                                  style={{ accentColor: '#d97706' }}
                                />
                                <span>{isLeaderSelected ? '⭐ Nhóm trưởng' : 'Làm Nhóm trưởng'}</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setTeamModalTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                  {submitting ? 'Đang tạo...' : '🚀 Hoàn tất Lập Nhóm & Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL E: XEM CHI TIẾT ĐỀ TÀI & NHÓM (BẢNG BÊN NGOÀI LUÔN GỌN SẠCH)
         ===================================================================== */}
      {detailTopicModal && (
        <div className="modal-backdrop open" onClick={() => setDetailTopicModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>📄 Chi tiết Đề tài &amp; Nhóm thực hiện</h3>
              <button className="drawer-close-btn" onClick={() => setDetailTopicModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: getTopicScaleInfo(detailTopicModal).bg, color: getTopicScaleInfo(detailTopicModal).color }}>
                  {getTopicScaleInfo(detailTopicModal).label}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: detailTopicModal.da_dang_ky ? '#dcfce7' : '#fef3c7', color: detailTopicModal.da_dang_ky ? '#15803d' : '#b45309' }}>
                  {detailTopicModal.da_dang_ky ? `Đã nhận (${detailTopicModal.team?.ten_nhom})` : 'Còn trống'}
                </span>
                {detailTopicModal.github_summary?.connected && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: '#f4f4f5', color: 'var(--text)' }}>
                    GitHub: {detailTopicModal.github_summary.repo_slug}
                  </span>
                )}
              </div>

              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                {detailTopicModal.ten_do_an}
              </h4>

              <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {detailTopicModal.mo_ta_sach || 'Chưa có mô tả chi tiết cho đề tài này.'}
              </div>

              {detailTopicModal.da_dang_ky && (detailTopicModal.team?.members?.length || 0) > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    Thành viên ({detailTopicModal.team.members.length} sinh viên):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {detailTopicModal.team.members.map(m => (
                      <div key={m.ma_nguoi_dung} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text)', fontWeight: m.vai_tro_trong_nhom === 'nhom_truong' ? 700 : 500 }}>
                          {m.ho_ten}{m.vai_tro_trong_nhom === 'nhom_truong' ? ' (Nhóm trưởng)' : ''}
                        </span>
                        <span>{m.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>Mốc tiến độ: <strong>{detailTopicModal.so_moc || 0}</strong></span>
                <span>Công việc: <strong>{detailTopicModal.so_cong_viec || 0}</strong></span>
                {detailTopicModal.da_dang_ky && (
                  <span>Tiến độ: <strong>{Number(detailTopicModal.tien_do_tong || 0).toFixed(0)}%</strong></span>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                {isLecturer && detailTopicModal.da_dang_ky && detailTopicModal.ma_do_an !== 'da-dacs-01' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (window.confirm('Đặt lại đề tài này về trạng thái trống?')) {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        resetTopicRegistration(targetId);
                      }
                    }}
                    style={{ color: '#dc2626', borderColor: '#fecaca' }}
                  >
                    Đặt lại về trống
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setDetailTopicModal(null)}>
                  Đóng
                </button>
                {detailTopicModal.da_dang_ky && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        enterWorkspace(targetId, 'github');
                      }}
                    >
                      GitHub
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const targetId = detailTopicModal.ma_do_an;
                        setDetailTopicModal(null);
                        enterWorkspace(targetId, 'kanban');
                      }}
                    >
                      Mở Kanban &rarr;
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
